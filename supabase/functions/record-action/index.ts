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

    const { sessionId, setId, teamId, playerId, actionType, result, zone } = await req.json();

    if (!sessionId || !setId || !teamId || !actionType || !result) {
      throw new Error('Missing required fields');
    }

    // Validate session access
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .select('id, club_id, created_by')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Create action
    const { data: action, error: actionError } = await supabaseClient
      .from('actions')
      .insert({
        session_id: sessionId,
        set_id: setId,
        team_id: teamId,
        player_id: playerId || null,
        action_type: actionType,
        result,
        zone: zone || null,
        created_by: user.id,
        ts: new Date().toISOString()
      })
      .select()
      .single();

    if (actionError) {
      console.error('Action creation error:', actionError);
      throw new Error('Failed to record action');
    }

    // Update set score if it's a point
    if (result === 'point') {
      const { error: updateError } = await supabaseClient
        .rpc('increment_team_score', {
          p_set_id: setId,
          p_team_id: teamId
        });

      if (updateError) {
        console.error('Score update error:', updateError);
        // Don't fail the action if score update fails
      }
    }

    console.log('Action recorded successfully:', action);

    return new Response(
      JSON.stringify({ 
        success: true, 
        action
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in record-action:', error);
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