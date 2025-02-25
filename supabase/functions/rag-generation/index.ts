
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

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

    const { templateId, context, documentIds } = await req.json()

    // 1. Récupérer le template
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw new Error('Template non trouvé')

    // 2. Récupérer les documents pertinents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('content, metadata')
      .in('id', documentIds)

    if (docsError) throw new Error('Erreur lors de la récupération des documents')

    // 3. Préparer le contexte pour la génération
    const documentContext = documents
      .map(doc => doc.content)
      .join('\n\n')

    // 4. Générer le contenu structuré
    const hf = new HfInference(Deno.env.get('HUGGINGFACE_API_KEY'))
    const generatedContent: Record<string, any> = {}

    for (const [key, config] of Object.entries(template.content_structure)) {
      console.log(`Génération de la section: ${key}`)
      const prompt = `
        Contexte: ${documentContext}
        
        Instructions: ${config.instructions}
        
        Générer le contenu pour la section "${key}" de type ${config.type}.
      `

      const result = await hf.textGeneration({
        model: 'tiiuae/falcon-7b-instruct',
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7
        }
      })

      generatedContent[key] = result.generated_text
    }

    // 5. Sauvegarder le document généré
    const { error: saveError } = await supabase
      .from('documents')
      .insert({
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        document_type: 'generated',
        template_type: template.template_type,
        generated_content: generatedContent,
        metadata: { 
          source_template: template.id,
          source_documents: documentIds
        }
      })

    if (saveError) throw new Error('Erreur lors de la sauvegarde du document')

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans rag-generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
