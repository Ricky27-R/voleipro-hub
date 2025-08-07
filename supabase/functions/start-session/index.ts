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

    const { type, title, opponent, clubId, teamId, location } = await req.json();

    if (!type || !title || !clubId || !teamId || !location) {
      throw new Error('Missing required fields');
    }

    // Create session
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        type,
        title,
        opponent,
        club_id: clubId,
        location,
        date: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create session');
    }

    // Create first set
    const { data: firstSet, error: setError } = await supabaseClient
      .from('sets')
      .insert({
        session_id: session.id,
        set_number: 1,
        team_score: 0,
        opp_score: 0
      })
      .select()
      .single();

    if (setError) {
      console.error('Set creation error:', setError);
      throw new Error('Failed to create first set');
    }

    console.log('Session started successfully:', { session, firstSet });

    return new Response(
      JSON.stringify({ 
        success: true, 
        session,
        currentSet: firstSet
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in start-session:', error);
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