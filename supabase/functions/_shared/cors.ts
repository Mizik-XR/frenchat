
// Configuration CORS adaptée pour Vercel et environnements de développement
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization, X-Api-Token, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Fonction helper pour gérer les requêtes OPTIONS (preflight)
export function handleCorsOptions(req: Request): Response | null {
  // Vérifier si c'est une requête OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

// Fonction pour ajouter les en-têtes CORS à une réponse existante
export function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  // Ajouter les en-têtes CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  // Créer une nouvelle réponse avec les en-têtes CORS
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Détecte si l'origine est de Vercel
export function isVercelOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return origin.endsWith('.vercel.app') || 
         origin.includes('frenchat.vercel.app') ||
         origin === 'https://frenchat.vercel.app';
}
