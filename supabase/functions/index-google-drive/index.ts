
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from "npm:@googleapis/drive@8.7.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer l'ID utilisateur
    const { user_id } = await req.json()
    if (!user_id) {
      throw new Error('User ID manquant')
    }

    console.log('Démarrage de l\'indexation pour l\'utilisateur:', user_id)

    // Récupérer le token d'accès Google Drive
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user_id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Token Google Drive non trouvé')
    }

    // Configurer le client Google Drive
    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_OAUTH_CLIENT_ID'),
      Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
    )

    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Lister les fichiers
    const response = await drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
      q: "mimeType='application/pdf' or mimeType='text/plain' or mimeType='application/vnd.google-apps.document'"
    })

    const files = response.data.files || []
    console.log(`${files.length} fichiers trouvés`)

    // Indexer chaque fichier
    for (const file of files) {
      try {
        // Récupérer le contenu du fichier
        let content = ''
        if (file.mimeType === 'application/vnd.google-apps.document') {
          const doc = await drive.files.export({
            fileId: file.id!,
            mimeType: 'text/plain'
          })
          content = doc.data as string
        } else {
          const doc = await drive.files.get({
            fileId: file.id!,
            alt: 'media'
          })
          content = doc.data as string
        }

        // Sauvegarder dans la base de données
        const { error: insertError } = await supabase
          .from('documents')
          .upsert({
            external_id: file.id,
            title: file.name,
            content: content,
            document_type: 'google_drive',
            metadata: {
              mimeType: file.mimeType,
              size: file.size,
              createdTime: file.createdTime,
              modifiedTime: file.modifiedTime
            },
            user_id
          })

        if (insertError) {
          console.error(`Erreur lors de l'indexation du fichier ${file.name}:`, insertError)
          continue
        }

        console.log(`Fichier indexé avec succès: ${file.name}`)
      } catch (error) {
        console.error(`Erreur lors du traitement du fichier ${file.name}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${files.length} fichiers indexés` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
