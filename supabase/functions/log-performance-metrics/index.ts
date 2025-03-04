
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { operation, duration, success, error, timestamp, cache_hit } = await req.json()

    // Validation des données entrantes
    if (!operation) {
      throw new Error('Le champ "operation" est requis')
    }
    
    if (typeof duration !== 'number') {
      throw new Error('Le champ "duration" doit être un nombre')
    }

    console.log(`Enregistrement des métriques pour l'opération ${operation}: ${duration}ms, succès=${success}`)

    const { data, error: dbError } = await supabase
      .from('performance_metrics')
      .insert([
        {
          operation,
          duration,
          success,
          error,
          timestamp: timestamp || new Date().toISOString(),
          cache_hit: !!cache_hit
        }
      ])
      .select()

    if (dbError) {
      console.error('Error logging metrics:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to log metrics' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (err) {
    console.error('Error processing request:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
