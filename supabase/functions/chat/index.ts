
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'npm:openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { messages, user_id, max_tokens = 500 } = await req.json()
    
    if (!messages || !user_id) {
      throw new Error('Messages et user_id requis')
    }

    // Récupérer le dernier message de l'utilisateur
    const userMessage = messages[messages.length - 1].content

    console.log('Recherche de documents pertinents pour:', userMessage)

    // Recherche de documents pertinents basée sur le message de l'utilisateur
    const { data: documents, error: searchError } = await supabase
      .from('documents')
      .select('content, title, document_type, metadata')
      .textSearch('content', userMessage.split(' ').join(' & '))
      .eq('document_type', 'google_drive')
      .limit(5)

    if (searchError) {
      console.error('Erreur de recherche:', searchError)
      throw new Error('Erreur lors de la recherche de documents')
    }

    // Préparation du contexte pour l'IA
    let context = "En te basant sur ces documents de Google Drive:\n\n"
    if (documents && documents.length > 0) {
      documents.forEach((doc, index) => {
        context += `Document ${index + 1} - ${doc.title}:\n${doc.content.substring(0, 1000)}...\n\n`
      })
    } else {
      context = "Aucun document pertinent trouvé. Réponds au mieux avec les informations disponibles.\n\n"
    }

    // Configuration de l'IA
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Préparation des messages pour l'IA
    const aiMessages = [
      {
        role: "system",
        content: `Tu es un assistant qui analyse les documents Google Drive des utilisateurs. 
                 Utilise le contexte fourni pour répondre aux questions.
                 Si tu n'as pas assez d'informations, dis-le clairement.
                 ${context}`
      },
      ...messages
    ]

    console.log('Envoi à OpenAI avec contexte')

    // Appel à l'API OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: aiMessages,
      max_tokens: max_tokens,
      temperature: 0.7,
    })

    const aiResponse = completion.data.choices[0].message

    // Log de l'interaction pour le monitoring
    await supabase.from('chat_messages').insert([
      {
        conversation_id: messages[0]?.conversation_id,
        role: 'assistant',
        content: aiResponse.content,
        user_id: user_id,
        metadata: {
          documents_used: documents?.map(d => ({ title: d.title, type: d.document_type })),
          tokens_used: completion.data.usage?.total_tokens
        }
      }
    ])

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
