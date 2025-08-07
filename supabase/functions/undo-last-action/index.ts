import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Get the last action for this session
    const { data: lastAction, error: actionError } = await supabaseClient
      .from('actions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('created_by', user.id)
      .order('ts', { ascending: false })
      .limit(1)
      .single();

    if (actionError || !lastAction) {
      throw new Error('No action found to undo');
    }

    // Delete the last action
    const { error: deleteError } = await supabaseClient
      .from('actions')
      .delete()
      .eq('id', lastAction.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error('Failed to undo action');
    }

    // If the action was a point, decrement the score
    if (lastAction.result === 'point') {
      const { error: updateError } = await supabaseClient
        .rpc('decrement_team_score', {
          p_set_id: lastAction.set_id,
          p_team_id: lastAction.team_id
        });

      if (updateError) {
        console.error('Score decrement error:', updateError);
        // Don't fail the undo if score update fails
      }
    }

    console.log('Action undone successfully:', lastAction);

    return new Response(
      JSON.stringify({ 
        success: true, 
        undoneAction: lastAction
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in undo-last-action:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});