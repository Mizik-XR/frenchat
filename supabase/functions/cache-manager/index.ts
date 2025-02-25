
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { connect } from 'https://deno.land/x/redis/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CACHE_EXPIRATION = 3600 // 1 heure en secondes
let redis = null;
let useRedis = false;

// Initialisation de Redis si les variables d'environnement sont présentes
try {
  if (Deno.env.get('REDIS_HOST') && Deno.env.get('REDIS_PASSWORD')) {
    redis = await connect({
      hostname: Deno.env.get('REDIS_HOST') || "localhost",
      port: parseInt(Deno.env.get('REDIS_PORT') || "6379"),
      password: Deno.env.get('REDIS_PASSWORD'),
    });
    useRedis = true;
    console.log('✅ Cache Redis initialisé avec succès');
  } else {
    console.warn('⚠️ Variables Redis non configurées, utilisation du cache alternatif');
  }
} catch (error) {
  console.warn('⚠️ Erreur de connexion Redis:', error.message);
}

// Cache alternatif en mémoire
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

const handleCacheOperation = async (action: string, fileId: string, hash?: string) => {
  const cacheKey = `file:${fileId}:hash`;
  
  if (useRedis && redis) {
    switch (action) {
      case 'check':
        const cachedHash = await redis.get(cacheKey);
        return { isIndexed: cachedHash === hash, cachedHash };
      case 'set':
        await redis.set(cacheKey, hash, { ex: CACHE_EXPIRATION });
        return { success: true };
      case 'invalidate':
        await redis.del(cacheKey);
        return { success: true };
      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  } else {
    // Cache en mémoire
    switch (action) {
      case 'check': {
        const now = Date.now();
        if (memoryCacheExpiry.has(cacheKey) && memoryCacheExpiry.get(cacheKey) < now) {
          memoryCache.delete(cacheKey);
          memoryCacheExpiry.delete(cacheKey);
        }
        const cachedHash = memoryCache.get(cacheKey);
        return { isIndexed: cachedHash === hash, cachedHash };
      }
      case 'set': {
        memoryCache.set(cacheKey, hash);
        memoryCacheExpiry.set(cacheKey, Date.now() + (CACHE_EXPIRATION * 1000));
        return { success: true };
      }
      case 'invalidate': {
        memoryCache.delete(cacheKey);
        memoryCacheExpiry.delete(cacheKey);
        return { success: true };
      }
      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, fileId, hash } = await req.json()
    console.log(`🔄 Action: ${action}, FileID: ${fileId}, Mode: ${useRedis ? 'Redis' : 'Mémoire'}`);

    const result = await handleCacheOperation(action, fileId, hash);
    
    if (action === 'check') {
      console.log(`📋 Vérification du cache - FileID: ${fileId}, Hash: ${hash}, Cached: ${result.cachedHash}`);
    } else {
      console.log(`✅ Opération cache réussie - Action: ${action}, FileID: ${fileId}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
