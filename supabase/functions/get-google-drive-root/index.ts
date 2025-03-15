
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer le token d'accès Google Drive
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Token d'accès Google Drive non trouvé" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Extraction et déchiffrement du token (si nécessaire)
    let accessToken = tokenData.access_token;
    if (typeof accessToken === 'string' && accessToken.startsWith('{') && accessToken.endsWith('}')) {
      try {
        const tokenObj = JSON.parse(accessToken);
        accessToken = tokenObj.data || accessToken;
      } catch (e) {
        console.error("Erreur lors du parsing du token:", e);
      }
    }

    // Récupérer les informations sur le dossier racine
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/root?fields=id,name`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur API Google Drive:", errorData);
      return new Response(
        JSON.stringify({ error: "Impossible d'accéder au dossier racine", details: errorData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status 
        }
      );
    }

    const rootFolderData = await response.json();

    // Obtenir un aperçu du nombre total de fichiers (estimation)
    const filesResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id)&pageSize=1&includeItemsFromAllDrives=true&supportsAllDrives=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    let totalFiles = 0;
    if (filesResponse.ok) {
      try {
        const filesData = await filesResponse.json();
        const filesCountResponse = await fetch(`https://www.googleapis.com/drive/v3/about?fields=storageQuota,user`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });
        
        if (filesCountResponse.ok) {
          const quotaData = await filesCountResponse.json();
          if (quotaData.storageQuota) {
            // Estimation grossière basée sur l'utilisation du stockage
            totalFiles = Math.round(parseInt(quotaData.storageQuota.usage || 0) / 1000000); // ~1MB par fichier en moyenne
            totalFiles = Math.max(totalFiles, 100); // Au moins 100 fichiers pour les petits drives
          }
        }
      } catch (e) {
        console.error("Erreur lors de l'estimation du nombre de fichiers:", e);
      }
    }

    return new Response(
      JSON.stringify({
        id: rootFolderData.id,
        name: rootFolderData.name,
        totalFiles: totalFiles
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
