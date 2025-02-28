
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { conversationId, title } = await req.json()

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'ID de conversation manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Récupérer les messages de la conversation
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      throw messagesError
    }

    // Récupérer les infos sur l'utilisateur qui possède le token Google
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    let userId
    
    if (token) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(token)
      if (userError) throw userError
      userId = user?.id
    } else {
      throw new Error('Utilisateur non authentifié')
    }

    // Récupérer le token Google de l'utilisateur
    const { data: oauthData, error: oauthError } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()
    
    if (oauthError || !oauthData?.access_token) {
      throw new Error('Token Google non trouvé. Veuillez reconnecter votre compte Google Drive.')
    }

    // Formater les messages pour le document
    const formattedContent = messages.map(msg => {
      const roleLabel = msg.role === 'user' ? 'Vous' : 'Assistant IA'
      const timestamp = new Date(msg.created_at).toLocaleString('fr-FR')
      return `**${roleLabel}** (${timestamp}):\n${msg.content}\n\n---\n\n`
    }).join('')

    // Créer le document sur Google Drive
    const documentTitle = title || 'Conversation exportée'
    
    const response = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oauthData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: documentTitle
      })
    })

    if (!response.ok) {
      const responseText = await response.text()
      throw new Error(`Erreur lors de la création du document: ${responseText}`)
    }

    const docData = await response.json()
    
    // Ajouter le contenu au document
    const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${docData.documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oauthData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            location: {
              index: 1
            },
            text: `# ${documentTitle}\n\n${formattedContent}`
          }
        }]
      })
    })

    if (!updateResponse.ok) {
      const updateResponseText = await updateResponse.text()
      throw new Error(`Erreur lors de la mise à jour du document: ${updateResponseText}`)
    }

    // Créer l'URL de visualisation du document
    const docUrl = `https://docs.google.com/document/d/${docData.documentId}/edit`

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: docData.documentId,
        documentUrl: docUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
