
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from "npm:@googleapis/drive@8.7.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileMetadata {
  id: string
  name: string
  mimeType: string
  parents?: string[]
  createdTime?: string
  modifiedTime?: string
  size?: number
  path?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    if (!user_id) {
      throw new Error('User ID manquant')
    }

    console.log('Démarrage de l\'indexation complète pour l\'utilisateur:', user_id)

    // Récupérer les tokens OAuth
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user_id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Token Google Drive non trouvé')
    }

    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_OAUTH_CLIENT_ID'),
      Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
    )

    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Fonction récursive pour explorer les dossiers
    async function* listAllFiles(parentId?: string): AsyncGenerator<FileMetadata> {
      let pageToken: string | undefined
      const supportedMimeTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.google-apps.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.google-apps.presentation'
      ]

      do {
        const query = [
          parentId ? `'${parentId}' in parents` : 'root in parents',
          'trashed = false'
        ].join(' and ')

        const response = await drive.files.list({
          pageSize: 100,
          pageToken,
          fields: 'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size)',
          q: query
        })

        const files = response.data.files || []
        pageToken = response.data.nextPageToken

        for (const file of files) {
          // Pour les dossiers, explorer récursivement
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            yield* listAllFiles(file.id)
          }
          // Pour les fichiers supportés, les retourner
          else if (supportedMimeTypes.includes(file.mimeType)) {
            yield file
          }
        }
      } while (pageToken)
    }

    // Fonction pour extraire le contenu d'un fichier
    async function extractFileContent(file: FileMetadata): Promise<string> {
      try {
        if (file.mimeType === 'application/vnd.google-apps.document') {
          const doc = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain'
          })
          return doc.data as string
        } 
        else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
          const sheet = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/csv'
          })
          return sheet.data as string
        }
        else if (file.mimeType === 'application/vnd.google-apps.presentation') {
          const presentation = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain'
          })
          return presentation.data as string
        }
        else {
          const doc = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          })
          return doc.data as string
        }
      } catch (error) {
        console.error(`Erreur lors de l'extraction du contenu pour ${file.name}:`, error)
        return ''
      }
    }

    // Compteurs pour le suivi
    let totalFiles = 0
    let indexedFiles = 0
    let errorFiles = 0

    // Indexation de tous les fichiers
    for await (const file of listAllFiles()) {
      totalFiles++
      try {
        console.log(`Traitement de ${file.name} (${file.mimeType})`)
        
        const content = await extractFileContent(file)
        if (!content) {
          console.warn(`Contenu vide pour ${file.name}, ignoré`)
          continue
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
              modifiedTime: file.modifiedTime,
              parents: file.parents
            },
            user_id
          })

        if (insertError) {
          console.error(`Erreur d'indexation pour ${file.name}:`, insertError)
          errorFiles++
          continue
        }

        indexedFiles++
        console.log(`Fichier indexé avec succès: ${file.name}`)

      } catch (error) {
        console.error(`Erreur lors du traitement de ${file.name}:`, error)
        errorFiles++
      }
    }

    // Mise à jour du statut d'indexation
    await supabase
      .from('oauth_tokens')
      .update({
        metadata: {
          last_indexed: new Date().toISOString(),
          total_files: totalFiles,
          indexed_files: indexedFiles,
          error_files: errorFiles
        }
      })
      .eq('user_id', user_id)
      .eq('provider', 'google')

    return new Response(
      JSON.stringify({ 
        success: true,
        stats: {
          total: totalFiles,
          indexed: indexedFiles,
          errors: errorFiles
        }
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
