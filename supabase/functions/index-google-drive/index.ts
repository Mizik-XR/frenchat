
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";
import { corsHeaders } from "./utils/corsHeaders.ts";
import { getGoogleDriveToken } from "./services/googleDriveAuth.ts";
import { indexFolder, updateIndexingProgress } from "./services/indexingService.ts";

const env = await load();

const supabaseUrl = Deno.env.get('SUPABASE_URL') || env['SUPABASE_URL'] || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || env['SUPABASE_SERVICE_ROLE_KEY'] || '';
const googleDriveApiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY') || env['GOOGLE_DRIVE_API_KEY'] || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, folderId, progressId } = await req.json();
    console.log('Fonction index-google-drive invoquée avec les paramètres:', { userId, folderId, progressId });

    if (!userId || !folderId || !progressId) {
      console.error('Paramètres manquants.');
      return new Response(JSON.stringify({ error: 'Paramètres userId, folderId et progressId requis.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupération du token Google Drive
    let accessToken;
    try {
      accessToken = await getGoogleDriveToken(userId);
    } catch (tokenError) {
      console.error("Erreur lors de la récupération du token Google Drive:", tokenError);
      return new Response(JSON.stringify({ error: 'Token Google Drive invalide ou expiré.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Démarrage de l'indexation
    await updateIndexingProgress(supabase, progressId, { status: 'running' });
    await indexFolder(supabase, userId, folderId, null, 0, accessToken, progressId, googleDriveApiKey);
    await updateIndexingProgress(supabase, progressId, { status: 'completed' });

    return new Response(JSON.stringify({ message: 'Indexation terminée avec succès.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la fonction index-google-drive:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
