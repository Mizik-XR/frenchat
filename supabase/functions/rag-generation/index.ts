
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { pipeline } from 'https://esm.sh/@huggingface/transformers@3.3.3'

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

    const { templateId, query, maxResults = 5 } = await req.json()

    // 1. Récupérer le template
    console.log('Récupération du template:', templateId)
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw new Error(`Template non trouvé: ${templateError.message}`)
    console.log('Template trouvé:', template.name)

    // 2. Recherche sémantique dans les chunks indexés
    console.log('Recherche de chunks pertinents pour:', query)
    const { data: relevantChunks, error: searchError } = await supabase
      .rpc('search_documents', {
        query_embedding: await generateEmbedding(query),
        match_threshold: 0.5,
        match_count: maxResults
      })

    if (searchError) throw new Error(`Erreur de recherche: ${searchError.message}`)
    console.log(`${relevantChunks.length} chunks trouvés`)

    // 3. Génération du contenu structuré
    const generatedContent: Record<string, string> = {}
    for (const [section, config] of Object.entries(template.content_structure)) {
      console.log(`Génération de la section: ${section}`)
      const context = relevantChunks
        .map(chunk => chunk.content)
        .join('\n\n')
      
      const prompt = `
        En utilisant ce contexte:
        ${context}

        Et suivant ces instructions:
        ${config.instructions}

        Générer le contenu pour la section "${section}".
        Type de contenu: ${config.type}
      `

      const sectionContent = await generateText(prompt)
      generatedContent[section] = sectionContent
    }

    // 4. Sauvegarde du document généré
    console.log('Sauvegarde du document généré')
    const { error: saveError } = await supabase
      .from('documents')
      .insert({
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        document_type: 'generated',
        template_type: template.template_type,
        generated_content: generatedContent,
        metadata: {
          source_template: template.id,
          generation_date: new Date().toISOString(),
          query: query
        }
      })

    if (saveError) throw new Error(`Erreur de sauvegarde: ${saveError.message}`)

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans rag-generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateEmbedding(text: string): Promise<number[]> {
  // Utilisation du modèle existant de la fonction generate-embeddings
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

async function generateText(prompt: string): Promise<string> {
  // Utilisation d'un modèle local léger pour la génération
  const generator = await pipeline('text-generation', 'Xenova/LaMini-Flan-T5-783M')
  const output = await generator(prompt, {
    max_length: 512,
    temperature: 0.7,
    top_p: 0.95
  })
  return output[0].generated_text
}
