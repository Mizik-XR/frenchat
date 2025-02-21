
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, serviceType, config } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Récupérer l'utilisateur à partir du token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Récupérer le client_id de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.client_id) {
      throw new Error('Profile not found')
    }

    switch (action) {
      case 'save': {
        const { data, error } = await supabase
          .from('service_configurations')
          .upsert({
            client_id: profile.client_id,
            service_type: serviceType,
            config: config,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id,service_type'
          })
          .select()
          .single()

        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      case 'get': {
        const { data, error } = await supabase
          .from('service_configurations')
          .select('*')
          .eq('client_id', profile.client_id)
          .eq('service_type', serviceType)
          .single()

        if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
        return new Response(JSON.stringify(data || {}), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
