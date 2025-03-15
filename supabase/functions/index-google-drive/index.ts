
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// Configuration de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Analyser le corps de la requête
    const { folder_id, user_id } = await req.json();

    if (!folder_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "ID de dossier et ID utilisateur requis" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Récupérer les informations d'accès à Google Drive
    const { data: tokens, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user_id)
      .eq('provider', 'google')
      .maybeSingle();

    if (tokenError || !tokens) {
      return new Response(
        JSON.stringify({ error: "Tokens d'accès Google Drive non trouvés" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Commencer l'indexation (simulé ici, à implémenter réellement)
    const indexingId = crypto.randomUUID();
    
    // Enregistrer le processus d'indexation
    const { error: progressError } = await supabase
      .from('indexing_progress')
      .insert({
        id: indexingId,
        user_id: user_id,
        source: 'google_drive',
        source_id: folder_id,
        status: 'pending',
        progress: 0,
        total_files: 0,
        processed_files: 0,
        metadata: { folder_id }
      });

    if (progressError) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'enregistrement du processus d'indexation" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Appeler la fonction Edge Supabase pour le traitement en arrière-plan
    await supabase.functions.invoke('batch-index-google-drive', {
      body: {
        indexing_id: indexingId,
        folder_id: folder_id,
        user_id: user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Indexation démarrée", 
        indexing_id: indexingId 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
