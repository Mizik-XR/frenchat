
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // 4. Générer le contenu structuré en fonction du template
    const generatedContent = await generateStructuredContent(
      template.content_structure,
      documentContext,
      context
    )

    // 5. Sauvegarder le résultat
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

async function generateStructuredContent(
  structure: any,
  context: string,
  userContext: string
): Promise<any> {
  // Initialiser le contenu généré avec la structure du template
  const generatedContent: Record<string, any> = {}

  // Parcourir la structure et générer le contenu pour chaque section
  for (const [key, config] of Object.entries(structure)) {
    // Générer un prompt spécifique pour cette section
    const prompt = generateSectionPrompt(key, config, context, userContext)
    
    // Utiliser le modèle local pour générer le contenu
    const sectionContent = await generateWithTransformers(prompt)
    
    // Stocker le contenu généré
    generatedContent[key] = sectionContent
  }

  return generatedContent
}

async function generateWithTransformers(prompt: string): Promise<string> {
  // TODO: Implémenter la génération avec Transformers
  // Pour l'instant, retourner un contenu de test
  return `Contenu généré pour: ${prompt}`
}

function generateSectionPrompt(
  section: string,
  config: any,
  context: string,
  userContext: string
): string {
  return `
    En utilisant le contexte suivant:
    ${context}

    Et les instructions de l'utilisateur:
    ${userContext}

    Générer le contenu pour la section "${section}" du document.
    Type de contenu attendu: ${config.type}
    Instructions spécifiques: ${config.instructions || 'Aucune'}
  `
}
