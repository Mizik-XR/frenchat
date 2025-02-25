
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = performance.now();
  
  try {
    const { action, query, filters, useHybridSearch = true } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'search') {
      console.log('🔍 Recherche avec paramètres:', { useHybridSearch, filters });

      // Obtenir l'embedding de la requête
      const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));
      const embedding = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: query
      });

      // Construction de la requête SQL de base
      let sqlQuery = `
        WITH ranked_results AS (
          SELECT 
            dc.id,
            dc.content,
            dc.document_id,
            dc.metadata,
            d.title,
            d.mime_type,
            d.created_at,
            1 - (dc.embedding <=> $1::vector) as vector_similarity,
            CASE 
              WHEN $2 = true THEN 
                ts_rank(to_tsvector('french', dc.content), plainto_tsquery('french', $3))
              ELSE 0
            END as text_similarity
          FROM document_chunks dc
          JOIN uploaded_documents d ON d.id = dc.document_id::uuid
          WHERE 1=1
      `;

      const params: any[] = [embedding, useHybridSearch, query];
      let paramCount = 3;

      // Ajout des filtres
      if (filters) {
        if (filters.mimeType) {
          paramCount++;
          sqlQuery += ` AND d.mime_type = $${paramCount}`;
          params.push(filters.mimeType);
        }
        if (filters.modifiedAfter) {
          paramCount++;
          sqlQuery += ` AND d.updated_at > $${paramCount}`;
          params.push(filters.modifiedAfter);
        }
        if (filters.documentType) {
          paramCount++;
          sqlQuery += ` AND d.file_type = $${paramCount}`;
          params.push(filters.documentType);
        }
      }

      // Finalisation de la requête avec scoring hybride
      sqlQuery += `
        )
        SELECT 
          *,
          CASE 
            WHEN $2 = true THEN 
              (vector_similarity * 0.7 + text_similarity * 0.3)
            ELSE vector_similarity
          END as final_score
        FROM ranked_results
        WHERE vector_similarity > 0.3
        ORDER BY final_score DESC
        LIMIT 10;
      `;

      console.log('🔄 Exécution de la recherche...');
      const { data: results, error } = await supabase.rpc('execute_search', {
        query_text: sqlQuery,
        query_params: params
      });

      if (error) throw error;

      // Re-ranking avec Cross-Encoder si activé
      if (useHybridSearch && results.length > 0) {
        console.log('🔄 Application du re-ranking...');
        const passages = results.map(r => r.content);
        
        const scores = await hf.featureExtraction({
          model: 'cross-encoder/ms-marco-MiniLM-L-6-v2',
          inputs: passages.map(p => ({ text_pair: [query, p] }))
        });

        // Combiner les scores
        results.forEach((r, i) => {
          r.cross_encoder_score = scores[i];
          r.final_score = r.final_score * 0.6 + scores[i] * 0.4;
        });

        // Re-trier les résultats
        results.sort((a, b) => b.final_score - a.final_score);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Enregistrer les métriques de performance
      await supabase
        .from('performance_metrics')
        .insert({
          operation: 'search',
          duration: Math.round(duration),
          success: true,
          timestamp: new Date().toISOString(),
          metadata: {
            useHybridSearch,
            resultCount: results.length,
            hasFilters: !!filters
          }
        });

      console.log(`✅ Recherche terminée en ${duration}ms`);
      
      return new Response(
        JSON.stringify({
          results,
          metadata: {
            duration,
            resultCount: results.length,
            useHybridSearch
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Action non supportée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    
    // Enregistrer l'erreur dans les métriques
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('performance_metrics')
      .insert({
        operation: 'search',
        duration: performance.now() - startTime,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
