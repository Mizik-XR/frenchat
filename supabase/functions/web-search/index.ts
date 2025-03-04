
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    // Use Bing Search API if available, otherwise fallback to a mock response
    let searchResults;
    
    if (Deno.env.get('BING_API_KEY')) {
      const BING_ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search';
      
      const searchResponse = await fetch(
        `${BING_ENDPOINT}?q=${encodeURIComponent(query)}&count=5&responseFilter=Webpages`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': Deno.env.get('BING_API_KEY') || '',
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Search API request failed');
      }

      const data = await searchResponse.json();
      console.log('Search results:', data);

      // Format results for display
      searchResults = data.webPages.value
        .map((page: any) => `${page.name}\n${page.snippet}\nSource: ${page.url}\n`)
        .join('\n---\n');
    } else {
      // Mock response if no API key is available
      searchResults = `Résultats de recherche pour "${query}":\n\n` +
        `Résultat 1: Information pertinente sur ${query}\nSource: https://example.com/info\n\n` +
        `Résultat 2: Plus de détails sur ${query}\nSource: https://example.com/details\n\n` +
        `(Résultats simulés - configurez une clé API Bing pour des résultats réels)`;
    }

    return new Response(
      JSON.stringify({ result: `Résultats de recherche pour "${query}":\n\n${searchResults}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in web-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
