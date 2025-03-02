
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Création du client Supabase avec les variables d'environnement
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Clés d'API disponibles pour différents services
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérification de l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé : Authentification requise');
    }
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (sessionError || !sessionData.user) {
      throw new Error('Non autorisé : Session invalide');
    }
    
    const userId = sessionData.user.id;

    // Récupération des données de la requête
    const { service, endpoint, method, payload } = await req.json();

    // Vérification des paramètres requis
    if (!service || !endpoint) {
      throw new Error('Paramètres manquants : service et endpoint sont requis');
    }
    
    // Configuration en fonction du service demandé
    let apiKey = '';
    let baseUrl = '';
    
    // Récupération de la configuration du service depuis la base de données
    const { data: serviceConfig, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', service)
      .maybeSingle();
      
    if (configError) {
      console.error(`Erreur lors de la récupération de la configuration pour ${service}:`, configError);
    }
    
    // Configuration en fonction du service demandé
    switch (service) {
      case 'openai':
        // Utiliser la clé de la base de données si disponible, sinon utiliser la clé d'environnement
        apiKey = serviceConfig?.config?.apiKey || OPENAI_API_KEY;
        baseUrl = 'https://api.openai.com/v1';
        break;
      case 'anthropic':
        apiKey = serviceConfig?.config?.apiKey || '';
        baseUrl = 'https://api.anthropic.com/v1';
        break;
      case 'gemini':
        apiKey = serviceConfig?.config?.apiKey || '';
        baseUrl = 'https://generativelanguage.googleapis.com/v1';
        break;
      default:
        throw new Error(`Service non supporté : ${service}`);
    }
    
    if (!apiKey) {
      throw new Error(`Clé API manquante pour le service ${service}`);
    }
    
    // Préparation des en-têtes en fonction du service
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    switch (service) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'gemini':
        // Pour Google, la clé API est souvent dans l'URL
        break;
    }
    
    // Construction de l'URL
    let url = `${baseUrl}/${endpoint}`;
    if (service === 'gemini' && !url.includes('key=')) {
      url += `?key=${apiKey}`;
    }
    
    // Exécution de la requête API
    const apiResponse = await fetch(url, {
      method: method || 'POST',
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    // Gestion des erreurs de l'API
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Erreur API ${service} (${apiResponse.status}):`, errorText);
      throw new Error(`Erreur du service ${service} (${apiResponse.status}): ${errorText}`);
    }
    
    // Traitement de la réponse
    const responseData = await apiResponse.json();
    
    // Journalisation de l'utilisation (pour des statistiques ou facturation)
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action: 'api_call',
        entity_type: service,
        entity_id: null,
        metadata: {
          endpoint,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      });
      
    if (logError) {
      console.error('Erreur lors de la journalisation:', logError);
    }
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erreur dans la fonction secure-api-proxy:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
