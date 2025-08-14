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
    const { sessionId } = await req.json()

    if (!sessionId) {
      throw new Error('ID de sesión requerido')
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

    // Get the last action for this session
    const { data: lastAction, error: actionError } = await supabaseClient
      .from('actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (actionError || !lastAction) {
      throw new Error('No hay acciones para deshacer')
    }

    // Delete the last action
    const { error: deleteError } = await supabaseClient
      .from('actions')
      .delete()
      .eq('id', lastAction.id)

    if (deleteError) {
      throw deleteError
    }

    // If the action was a point, update the set score
    if (lastAction.result === 'point') {
      const { data: currentSet, error: setError } = await supabaseClient
        .from('sets')
        .select('team_score, opp_score')
        .eq('id', lastAction.set_id)
        .single()

      if (setError) {
        throw setError
      }

      // Determine which team scored and reduce their score
      const { data: sessionTeam, error: sessionTeamError } = await supabaseClient
        .from('sessions')
        .select('team_id')
        .eq('id', sessionId)
        .single()

      if (sessionTeamError) {
        throw sessionTeamError
      }

      const isTeamScore = sessionTeam.team_id === lastAction.team_id
      
      if (isTeamScore) {
        await supabaseClient
          .from('sets')
          .update({ team_score: Math.max(0, (currentSet.team_score || 0) - 1) })
          .eq('id', lastAction.set_id)
      } else {
        await supabaseClient
          .from('sets')
          .update({ opp_score: Math.max(0, (currentSet.opp_score || 0) - 1) })
          .eq('id', lastAction.set_id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        undoneAction: lastAction
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error undoing action:', error)
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