import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Get the request body
    const { sessionId, setId, teamId, playerId, actionType, result, zone } = await req.json()

    // Validate required fields
    if (!sessionId || !setId || !teamId || !actionType || !result) {
      throw new Error('Faltan campos requeridos')
    }

    // Verify the user belongs to the club that owns the session
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .select('club_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Sesión no encontrada')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('club_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.club_id !== session.club_id) {
      throw new Error('Usuario no tiene permisos para esta sesión')
    }

    // Create the action
    const { data: action, error: actionError } = await supabaseClient
      .from('actions')
      .insert({
        session_id: sessionId,
        set_id: setId,
        team_id: teamId,
        player_id: playerId,
        action_type: actionType,
        result,
        zone,
        created_by: user.id
      })
      .select()
      .single()

    if (actionError) {
      throw actionError
    }

    // Update set scores if it's a point
    if (result === 'point') {
      const { data: currentSet, error: setError } = await supabaseClient
        .from('sets')
        .select('team_score, opp_score')
        .eq('id', setId)
        .single()

      if (setError) {
        throw setError
      }

      // Determine which team scored (assuming teamId is the scoring team)
      const { data: sessionTeam, error: sessionTeamError } = await supabaseClient
        .from('sessions')
        .select('team_id')
        .eq('id', sessionId)
        .single()

      if (sessionTeamError) {
        throw sessionTeamError
      }

      const isTeamScore = sessionTeam.team_id === teamId
      
      if (isTeamScore) {
        await supabaseClient
          .from('sets')
          .update({ team_score: (currentSet.team_score || 0) + 1 })
          .eq('id', setId)
      } else {
        await supabaseClient
          .from('sets')
          .update({ opp_score: (currentSet.opp_score || 0) + 1 })
          .eq('id', setId)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error recording action:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})