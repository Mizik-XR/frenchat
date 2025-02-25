
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { connect } from 'https://deno.land/x/redis/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CACHE_EXPIRATION = 3600 // 1 heure en secondes
const redis = await connect({
  hostname: Deno.env.get('REDIS_HOST') || "localhost",
  port: parseInt(Deno.env.get('REDIS_PORT') || "6379"),
  password: Deno.env.get('REDIS_PASSWORD'),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, fileId, hash } = await req.json()
    console.log(`🔄 Action: ${action}, FileID: ${fileId}`);

    const cacheKey = `file:${fileId}:hash`
    
    switch (action) {
      case 'check': {
        const cachedHash = await redis.get(cacheKey)
        const isIndexed = cachedHash === hash
        console.log(`📋 Vérification du cache - FileID: ${fileId}, Hash: ${hash}, Cached: ${cachedHash}`);
        
        return new Response(
          JSON.stringify({ isIndexed, cachedHash }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'set': {
        await redis.set(cacheKey, hash, { ex: CACHE_EXPIRATION })
        console.log(`✅ Mise en cache - FileID: ${fileId}, Hash: ${hash}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'invalidate': {
        await redis.del(cacheKey)
        console.log(`🗑️ Cache invalidé - FileID: ${fileId}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      default:
        throw new Error(`Action non supportée: ${action}`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
