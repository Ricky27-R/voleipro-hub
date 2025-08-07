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

    const { actions } = await req.json();

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      throw new Error('No actions provided');
    }

    // Validate all actions have required fields
    for (const action of actions) {
      if (!action.sessionId || !action.setId || !action.teamId || !action.actionType || !action.result) {
        throw new Error('Missing required fields in action');
      }
    }

    // Prepare actions for batch insert
    const actionsToInsert = actions.map(action => ({
      session_id: action.sessionId,
      set_id: action.setId,
      team_id: action.teamId,
      player_id: action.playerId || null,
      action_type: action.actionType,
      result: action.result,
      zone: action.zone || null,
      created_by: user.id,
      ts: action.timestamp || new Date().toISOString(),
      synced: true
    }));

    // Insert all actions in batch
    const { data: insertedActions, error: insertError } = await supabaseClient
      .from('actions')
      .insert(actionsToInsert)
      .select();

    if (insertError) {
      console.error('Batch insert error:', insertError);
      throw new Error('Failed to save actions batch');
    }

    console.log(`Successfully saved ${insertedActions.length} actions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedActions.length,
        actions: insertedActions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in save-actions-batch:', error);
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