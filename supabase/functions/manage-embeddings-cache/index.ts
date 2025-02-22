
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface CacheRequest {
  action: 'get' | 'set' | 'invalidate';
  key: string;
  value?: any;
  ttl?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, key, value, ttl = 3600 } = await req.json() as CacheRequest;

    switch (action) {
      case 'get':
        const { data: cachedData, error: getError } = await supabaseClient
          .from('embeddings_cache')
          .select('value')
          .eq('key', key)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (getError) throw getError;

        // Incrémenter le compteur d'accès si on trouve une valeur
        if (cachedData) {
          await supabaseClient.rpc('increment_cache_access_count', { cache_key: key });
        }

        return new Response(
          JSON.stringify({ value: cachedData?.value }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'set':
        const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
        const { error: setError } = await supabaseClient
          .from('embeddings_cache')
          .upsert({
            key,
            value,
            expires_at: expiresAt,
            access_count: 1 // Initialiser le compteur d'accès
          });

        if (setError) throw setError;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'invalidate':
        const { error: invalidateError } = await supabaseClient
          .from('embeddings_cache')
          .delete()
          .eq('key', key);

        if (invalidateError) throw invalidateError;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Action non supportée');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
