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
    const { type, title, opponent, clubId, teamId, location } = await req.json()

    // Validate required fields
    if (!type || !title || !clubId || !teamId || !location) {
      throw new Error('Faltan campos requeridos')
    }

    // Verify the user belongs to the club
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('club_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.club_id !== clubId) {
      throw new Error('Usuario no pertenece al club especificado')
    }

    // Create the session
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        club_id: clubId,
        team_id: teamId,
        type,
        title,
        opponent,
        location,
        created_by: user.id
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    // Create the first set
    const { data: set, error: setError } = await supabaseClient
      .from('sets')
      .insert({
        session_id: session.id,
        set_number: 1,
        team_score: 0,
        opp_score: 0,
        is_completed: false
      })
      .select()
      .single()

    if (setError) {
      throw setError
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: { ...session, sets: [set] }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error starting session:', error)
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