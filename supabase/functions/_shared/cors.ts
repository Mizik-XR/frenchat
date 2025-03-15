
/**
 * En-têtes CORS partagés pour les Edge Functions
 */

// En-têtes CORS standard pour toutes les Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction d'aide pour gérer les requêtes OPTIONS
export function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Fonction pour ajouter les en-têtes CORS à une réponse
export function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Ajouter les en-têtes CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Créer une nouvelle réponse avec les en-têtes mis à jour
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Fonction helper pour créer une réponse JSON avec CORS
export function corsJsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Fonction helper pour créer une réponse d'erreur avec CORS
export function corsErrorResponse(message: string, status = 400) {
  return corsJsonResponse({ error: message }, status);
}
