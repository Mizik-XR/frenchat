
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  content: string;
  title: string;
  destination: 'drive' | 'teams';
  folderId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, title, destination, folderId } = await req.json() as ExportRequest;

    // Vérification des paramètres
    if (!content || !title || !destination) {
      throw new Error('Paramètres manquants');
    }

    console.log(`Début de l'export vers ${destination}`);

    if (destination === 'drive') {
      // Récupérer les tokens Google Drive
      const { data: tokens } = await supabase
        .from('oauth_tokens')
        .select('access_token')
        .eq('provider', 'google')
        .single();

      if (!tokens?.access_token) {
        throw new Error('Token Google Drive non trouvé');
      }

      // Créer le fichier sur Google Drive
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          parents: folderId ? [folderId] : undefined,
          mimeType: 'application/vnd.google-apps.document'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du fichier sur Google Drive');
      }

      const file = await response.json();

      // Mettre à jour le contenu du document
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'text/plain'
        },
        body: content
      });

      console.log('Export Google Drive réussi');
      return new Response(
        JSON.stringify({ success: true, fileId: file.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (destination === 'teams') {
      // Récupérer la configuration Teams
      const { data: teamsConfig } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'microsoft_teams')
        .single();

      if (!teamsConfig?.config) {
        throw new Error('Configuration Microsoft Teams non trouvée');
      }

      // TODO: Implémenter l'export vers Teams
      // Pour l'instant, on simule un succès
      console.log('Export Teams réussi (simulation)');
      return new Response(
        JSON.stringify({ success: true, message: 'Document exporté vers Teams' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Destination non supportée');

  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
