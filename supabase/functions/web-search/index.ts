
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

    // Format des résultats pour l'affichage
    const formattedResults = data.webPages.value
      .map((page: any) => `${page.name}\n${page.snippet}\nSource: ${page.url}\n`)
      .join('\n---\n');

    return new Response(
      JSON.stringify({ 
        result: `Résultats de recherche pour "${query}":\n\n${formattedResults}` 
      }),
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
