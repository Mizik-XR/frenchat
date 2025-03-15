
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
    const { folderId, user_id, options, mode = 'folder' } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "ID utilisateur requis" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Pour l'indexation complète, on peut utiliser 'root' si aucun folderId n'est fourni
    const targetFolderId = mode === 'full_drive' ? (folderId || 'root') : folderId;
    
    if (!targetFolderId) {
      return new Response(
        JSON.stringify({ error: "ID de dossier requis" }),
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

    // Préparer les options d'indexation
    const indexingOptions = {
      ...(options || {}),
      recursive: options?.recursive !== false,
      maxDepth: options?.maxDepth || (mode === 'full_drive' ? 50 : 10),
      batchSize: options?.batchSize || 100,
      fullDriveMode: mode === 'full_drive',
      priorityFileTypes: options?.priorityFileTypes || ['document', 'spreadsheet', 'presentation', 'pdf'],
      throttleRequests: options?.throttleRequests !== false,
      requestsPerMinute: options?.requestsPerMinute || 300
    };

    // Commencer l'indexation
    const indexingId = crypto.randomUUID();
    
    // Enregistrer le processus d'indexation
    const { error: progressError } = await supabase
      .from('indexing_progress')
      .insert({
        id: indexingId,
        user_id: user_id,
        source: 'google_drive',
        source_id: targetFolderId,
        status: 'pending',
        progress: 0,
        total_files: 0,
        processed_files: 0,
        metadata: { 
          folder_id: targetFolderId,
          options: indexingOptions,
          mode: mode
        }
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
        folder_id: targetFolderId,
        user_id: user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        options: indexingOptions
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: mode === 'full_drive' ? "Indexation complète du Google Drive démarrée" : "Indexation du dossier démarrée", 
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
