
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer le token Google Drive
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('provider', 'google')
      .single();

    if (!tokenData) {
      throw new Error('Google Drive non connecté');
    }

    // Fonction récursive pour parcourir les dossiers
    async function indexFolder(folderId = 'root') {
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType,size,modifiedTime)`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }

      const data = await response.json();
      
      for (const file of data.files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Récursion pour les sous-dossiers
          await indexFolder(file.id);
        } else {
          // Indexer le fichier
          await supabase.from('uploaded_documents').upsert({
            title: file.name,
            file_type: file.mimeType,
            size: file.size || 0,
            file_path: `gdrive/${file.id}`,
            metadata: {
              google_file_id: file.id,
              modified_time: file.modifiedTime,
            },
          });
        }
      }
    }

    // Démarrer l'indexation depuis la racine
    await indexFolder();

    return new Response(
      JSON.stringify({ success: true, message: 'Indexation terminée' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
