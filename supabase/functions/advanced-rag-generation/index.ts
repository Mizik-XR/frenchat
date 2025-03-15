
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion CORS pour les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérification de l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialisation du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validation de l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not authenticated');
    }

    // Récupération de la clé API OpenAI
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'openai')
      .maybeSingle();

    if (apiKeyError) {
      throw new Error(`Failed to retrieve OpenAI API key: ${apiKeyError.message}`);
    }

    const openaiApiKey = apiKeyData?.config?.apiKey;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Traitement de la requête
    const { action = 'query', content, query, filename, name, instructions, fileIds, threadId, assistantId, userId } = await req.json();

    // Logging
    console.log(`Processing ${action} request from user ${userId || user.id}`);

    let responseData;
    switch (action) {
      case 'query':
        responseData = await processRagQuery(openaiApiKey, content, query);
        break;
      case 'create_file':
        responseData = await createFile(openaiApiKey, content, filename);
        break;
      case 'create_assistant':
        responseData = await createAssistant(openaiApiKey, name, instructions, fileIds);
        break;
      case 'create_thread':
        responseData = await createThread(openaiApiKey);
        break;
      case 'send_message':
        responseData = await sendMessage(openaiApiKey, threadId, assistantId, content);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Enregistrer les métriques d'utilisation
    try {
      await supabase.from('ai_usage_metrics').insert({
        user_id: user.id,
        service: 'openai',
        endpoint: action,
        tokens_used: responseData.usage?.total_tokens || 0,
        cost: calculateCost(responseData.usage?.total_tokens || 0, 'gpt-4o'),
        metadata: {
          model: 'gpt-4o',
          success: true
        }
      });
    } catch (metricError) {
      console.error('Failed to log usage metrics:', metricError);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processRagQuery(apiKey: string, content: string, query: string) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const systemPrompt = `Tu es un assistant IA spécialisé dans la génération de réponses précises basées sur le contexte fourni. 
  Utilise les informations suivantes pour répondre à la question de l'utilisateur. 
  Si la réponse ne peut pas être déterminée à partir du contexte, indique-le clairement.
  
  CONTEXTE:
  ${content}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    answer: data.choices[0].message.content,
    usage: data.usage
  };
}

async function createFile(apiKey: string, content: string, filename: string) {
  const url = 'https://api.openai.com/v1/files';
  
  // Créer un fichier temporaire
  const encoder = new TextEncoder();
  const fileData = encoder.encode(content);
  
  const formData = new FormData();
  formData.append('purpose', 'assistants');
  formData.append('file', new Blob([fileData], { type: 'text/plain' }), filename);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI File API error:', errorData);
    throw new Error(`OpenAI File API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    fileId: data.id
  };
}

async function createAssistant(apiKey: string, name: string, instructions: string, fileIds: string[]) {
  const url = 'https://api.openai.com/v1/assistants';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      name,
      instructions,
      model: 'gpt-4o',
      tools: [{ type: 'retrieval' }],
      file_ids: fileIds
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI Assistant API error:', errorData);
    throw new Error(`OpenAI Assistant API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    assistantId: data.id
  };
}

async function createThread(apiKey: string) {
  const url = 'https://api.openai.com/v1/threads';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({})
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI Thread API error:', errorData);
    throw new Error(`OpenAI Thread API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    threadId: data.id
  };
}

async function sendMessage(apiKey: string, threadId: string, assistantId: string, content: string) {
  // 1. Ajouter le message au thread
  const messageUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;
  const messageResponse = await fetch(messageUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      role: 'user',
      content
    })
  });
  
  if (!messageResponse.ok) {
    const errorData = await messageResponse.text();
    console.error('OpenAI Message API error:', errorData);
    throw new Error(`OpenAI Message API error: ${messageResponse.status}`);
  }
  
  // 2. Exécuter l'assistant sur le thread
  const runUrl = `https://api.openai.com/v1/threads/${threadId}/runs`;
  const runResponse = await fetch(runUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });
  
  if (!runResponse.ok) {
    const errorData = await runResponse.text();
    console.error('OpenAI Run API error:', errorData);
    throw new Error(`OpenAI Run API error: ${runResponse.status}`);
  }
  
  const runData = await runResponse.json();
  const runId = runData.id;
  
  // 3. Attendre que le run soit terminé
  let runStatus = 'queued';
  while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled') {
    // Attendre un peu avant de vérifier à nouveau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusUrl = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    const statusResponse = await fetch(statusUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    
    if (!statusResponse.ok) {
      const errorData = await statusResponse.text();
      console.error('OpenAI Run Status API error:', errorData);
      throw new Error(`OpenAI Run Status API error: ${statusResponse.status}`);
    }
    
    const statusData = await statusResponse.json();
    runStatus = statusData.status;
    
    if (statusData.status === 'requires_action') {
      // Gérer les actions requises par l'assistant (si nécessaire)
      console.log('Run requires action:', statusData.required_action);
      // Implémentation à compléter si nécessaire
    }
  }
  
  if (runStatus !== 'completed') {
    throw new Error(`Run failed with status: ${runStatus}`);
  }
  
  // 4. Récupérer les messages du thread
  const messagesUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;
  const messagesResponse = await fetch(messagesUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    }
  });
  
  if (!messagesResponse.ok) {
    const errorData = await messagesResponse.text();
    console.error('OpenAI Messages List API error:', errorData);
    throw new Error(`OpenAI Messages List API error: ${messagesResponse.status}`);
  }
  
  const messagesData = await messagesResponse.json();
  // Trouver le dernier message de l'assistant
  const assistantMessages = messagesData.data.filter((msg: any) => msg.role === 'assistant');
  if (assistantMessages.length === 0) {
    throw new Error('No assistant messages found');
  }
  
  // Prendre le message le plus récent de l'assistant
  const latestMessage = assistantMessages[0];
  return {
    response: latestMessage.content[0].text.value,
    messageId: latestMessage.id
  };
}

function calculateCost(tokens: number, model: string): number {
  // Tarifs OpenAI par 1000 tokens (approximatifs)
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
  };
  
  const rate = rates[model] || rates['gpt-4o'];
  // Estimation simple (moitié entrée, moitié sortie)
  const inputTokens = tokens / 2;
  const outputTokens = tokens / 2;
  
  return (inputTokens * rate.input + outputTokens * rate.output) / 1000;
}
