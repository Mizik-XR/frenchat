
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// En-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérification de la clé API
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Clé API OpenAI non configurée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données de la requête
    const { action, content, filename, name, instructions, fileIds, threadId, assistantId, userId } = await req.json();

    // Traiter l'action demandée
    switch (action) {
      case 'create-file':
        return await createFile(content, filename);
      case 'create-assistant':
        return await createAssistant(name, instructions, fileIds);
      case 'create-thread':
        return await createThread();
      case 'send-message':
        return await sendMessage(threadId, assistantId, content);
      default:
        return new Response(
          JSON.stringify({ error: 'Action non reconnue' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error(`Erreur dans la fonction OpenAI RAG: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction pour créer un fichier
async function createFile(content: string, filename: string) {
  try {
    // Créer un fichier temporaire
    const tempFilePath = `/tmp/${filename}`;
    await Deno.writeTextFile(tempFilePath, content);
    
    // Créer un formdata pour l'upload
    const formData = new FormData();
    const fileBlob = new Blob([await Deno.readFile(tempFilePath)], { type: 'text/plain' });
    formData.append('file', fileBlob, filename);
    formData.append('purpose', 'assistants');

    // Envoyer la requête à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    
    // Nettoyer le fichier temporaire
    await Deno.remove(tempFilePath);

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${data.error?.message || 'Erreur inconnue'}`);
    }

    return new Response(
      JSON.stringify({ fileId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Erreur lors de la création du fichier: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour créer un assistant
async function createAssistant(name: string, instructions: string, fileIds: string[]) {
  try {
    const response = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        name,
        instructions,
        tools: [{ type: 'retrieval' }],
        file_ids: fileIds
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${data.error?.message || 'Erreur inconnue'}`);
    }

    return new Response(
      JSON.stringify({ assistantId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Erreur lors de la création de l'assistant: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour créer un thread
async function createThread() {
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${data.error?.message || 'Erreur inconnue'}`);
    }

    return new Response(
      JSON.stringify({ threadId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Erreur lors de la création du thread: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour envoyer un message et attendre la réponse
async function sendMessage(threadId: string, assistantId: string, content: string) {
  try {
    // Ajouter le message au thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    if (!messageResponse.ok) {
      const messageData = await messageResponse.json();
      throw new Error(`Erreur lors de l'ajout du message: ${messageData.error?.message || 'Erreur inconnue'}`);
    }

    // Exécuter l'assistant sur le thread
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    const runData = await runResponse.json();

    if (!runResponse.ok) {
      throw new Error(`Erreur lors de l'exécution de l'assistant: ${runData.error?.message || 'Erreur inconnue'}`);
    }

    // Attendre que l'exécution soit terminée
    let run = runData;
    while (run.status !== 'completed' && run.status !== 'failed') {
      // Attendre un peu avant de vérifier à nouveau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer l'état de l'exécution
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      });
      
      run = await statusResponse.json();
      
      if (run.status === 'failed') {
        throw new Error(`L'exécution a échoué: ${run.last_error?.message || 'Erreur inconnue'}`);
      }
    }

    // Récupérer les messages du thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const messagesData = await messagesResponse.json();

    // Le premier message est la réponse de l'assistant (les messages sont dans l'ordre inverse)
    const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('Aucune réponse de l\'assistant trouvée');
    }

    // Extraire le contenu de la réponse
    const responseContent = assistantMessage.content[0].text.value;

    return new Response(
      JSON.stringify({ response: responseContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Erreur lors de l'envoi du message: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
