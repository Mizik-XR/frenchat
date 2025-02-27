
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  query: string;
  conversation_id?: string;
  document_ids?: string[];
  filters?: {
    date_range?: { start: string; end: string };
    source_types?: string[];
    authors?: string[];
  };
  options?: {
    hybridSearch: boolean;
    useQueryClassification: boolean;
    enhanceWithMetadata: boolean;
    minSimilarityThreshold: number;
    maxResults: number;
    reranking: boolean;
  };
  model_config?: {
    model: string;
    temperature: number;
    max_tokens: number;
    streaming?: boolean;
  };
}

// Classification des types de questions
const QUESTION_PATTERNS = {
  factual: [
    /qui est|qu'est.ce que|quand|où|combien|quel/i,
    /définir|définition|signifie/i
  ],
  conceptual: [
    /pourquoi|comment|expliquer|concept|comprendre/i,
    /quelle est la différence|comparer/i
  ],
  procedural: [
    /comment faire|étapes|processus|méthode/i,
    /guide|tutoriel|instructions/i
  ],
  comparative: [
    /différence entre|vs|versus|comparé à|meilleur/i,
    /avantages|inconvénients|pour et contre/i
  ]
};

// Classifie une question selon son type
function classifyQuestion(question: string): string {
  for (const [type, patterns] of Object.entries(QUESTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(question)) {
        return type;
      }
    }
  }
  
  return 'general';
}

// Extrait les mots-clés importants d'une question
function extractKeywords(text: string): string[] {
  // Supprimer les mots vides
  const stopwords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'ce', 'cette', 'ces', 'est', 'sont'];
  
  // Diviser en mots, filtrer les stopwords et les mots courts
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));
  
  // Supprimer les duplicats
  return [...new Set(words)];
}

// Normalise un vecteur (améliore la similarité cosinus)
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Incrémente un compteur de cache
async function incrementCacheAccessCount(supabase: any, cacheKey: string) {
  await supabase.rpc('increment_cache_access_count', { cache_key: cacheKey });
}

// Génère une clé de cache
function generateCacheKey(text: string, model: string): string {
  const normalizedText = text.trim().toLowerCase();
  return `${model}_${normalizedText}`;
}

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extraire la configuration RAG
    const { data: ragConfigData } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'rag')
      .maybeSingle();
      
    const ragConfig = ragConfigData?.config || {
      useHybridSearch: true,
      useQueryClassification: true,
      enhanceWithMetadata: true,
      minSimilarityThreshold: 0.7,
      maxResults: 5,
      reranking: true,
      normalizeVectors: true
    };
    
    // Analyser le corps de la requête
    const requestData: RequestBody = await req.json();
    const { 
      query, 
      conversation_id, 
      document_ids, 
      filters, 
      options,
      model_config 
    } = requestData;
    
    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'La requête ne peut pas être vide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Configuration de la recherche
    const searchOptions = {
      ...ragConfig,
      ...options
    };
    
    // Configuration du modèle
    const modelConfig = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1024,
      ...model_config
    };
    
    console.log('Requête:', query);
    console.log('Options de recherche:', searchOptions);
    
    // Étape 1: Obtenir l'embedding pour la requête
    let queryEmbedding;
    
    // Vérifier le cache pour l'embedding
    if (ragConfig.usePersistentCache) {
      const cacheKey = generateCacheKey(query, 'query_embedding');
      const now = new Date();
      
      const { data: cachedEmbedding, error: cacheError } = await supabase
        .from('embeddings_cache')
        .select('value')
        .eq('key', cacheKey)
        .gt('expires_at', now.toISOString())
        .maybeSingle();
        
      if (!cacheError && cachedEmbedding) {
        console.log('Cache hit pour l\'embedding de la requête');
        queryEmbedding = cachedEmbedding.value.embedding;
        
        // Incrémenter le compteur d'accès
        await incrementCacheAccessCount(supabase, cacheKey);
      }
    }
    
    // Si pas dans le cache, générer un nouvel embedding
    if (!queryEmbedding) {
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'generate-embedding',
        {
          body: { 
            text: query,
            config: {
              model: ragConfig.embeddingModel || 'text-embedding-ada-002',
              provider: 'openai'
            }
          },
        }
      );
      
      if (embeddingError || !embeddingData) {
        throw new Error(`Erreur lors de la génération de l'embedding: ${embeddingError || 'Données manquantes'}`);
      }
      
      queryEmbedding = embeddingData;
      
      // Si la normalisation est activée
      if (ragConfig.normalizeVectors) {
        queryEmbedding = normalizeVector(queryEmbedding);
      }
      
      // Stocker dans le cache si activé
      if (ragConfig.usePersistentCache) {
        const cacheKey = generateCacheKey(query, 'query_embedding');
        const now = new Date();
        const cacheTTL = ragConfig.cacheTTL || 10080; // 7 jours par défaut
        const expiresAt = new Date(now.getTime() + cacheTTL * 60 * 1000);
        
        await supabase
          .from('embeddings_cache')
          .upsert({
            key: cacheKey,
            value: { embedding: queryEmbedding, text: query },
            expires_at: expiresAt.toISOString(),
            compression_enabled: ragConfig.compressionEnabled || false,
            access_count: 1
          }, {
            onConflict: 'key'
          });
      }
    }
    
    // Étape 2: Recherche sémantique via embeddings
    let relevantDocuments = [];
    
    // Recherche vectorielle
    const { data: semanticResults, error: semanticError } = await supabase.rpc(
      'search_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: searchOptions.minSimilarityThreshold,
        match_count: searchOptions.maxResults * 2  // Récupérer plus pour le filtrage
      }
    );
    
    if (semanticError) {
      throw new Error(`Erreur lors de la recherche sémantique: ${semanticError.message}`);
    }
    
    relevantDocuments = semanticResults || [];
    
    // Étape 3: Recherche hybride (si activée)
    if (searchOptions.useHybridSearch) {
      const keywords = extractKeywords(query);
      
      if (keywords.length > 0) {
        // Construire la requête fulltext
        const keywordQuery = keywords.join(' & ');
        
        const { data: keywordResults, error: keywordError } = await supabase
          .from('document_chunks')
          .select('*, metadata')
          .textSearch('content', keywordQuery)
          .limit(searchOptions.maxResults);
          
        if (!keywordError && keywordResults) {
          // Ajouter les résultats par mots-clés non déjà présents
          const existingIds = new Set(relevantDocuments.map((r: any) => r.id));
          
          for (const result of keywordResults) {
            if (!existingIds.has(result.id)) {
              relevantDocuments.push({
                ...result,
                similarity: 0.6  // Score par défaut pour les résultats par mots-clés
              });
            }
          }
        }
      }
    }
    
    // Étape 4: Classification de la question (si activée)
    let queryType = 'general';
    if (searchOptions.useQueryClassification) {
      queryType = classifyQuestion(query);
      console.log('Type de question identifié:', queryType);
    }
    
    // Étape 5: Filtrage et tri des résultats
    if (searchOptions.enhanceWithMetadata && filters) {
      // Filtrage par date si spécifié
      if (filters.date_range) {
        relevantDocuments = relevantDocuments.filter((doc: any) => {
          if (!doc.metadata || !doc.metadata.date) return true;
          const docDate = new Date(doc.metadata.date);
          return docDate >= new Date(filters.date_range!.start) &&
                docDate <= new Date(filters.date_range!.end);
        });
      }
      
      // Filtrage par type de source
      if (filters.source_types && filters.source_types.length > 0) {
        relevantDocuments = relevantDocuments.filter((doc: any) => {
          if (!doc.metadata || !doc.metadata.source_type) return true;
          return filters.source_types!.includes(doc.metadata.source_type);
        });
      }
      
      // Filtrage par auteur
      if (filters.authors && filters.authors.length > 0) {
        relevantDocuments = relevantDocuments.filter((doc: any) => {
          if (!doc.metadata || !doc.metadata.author) return true;
          return filters.authors!.includes(doc.metadata.author);
        });
      }
    }
    
    // Étape 6: Réorganisation des résultats selon le type de question (si activée)
    if (searchOptions.reranking) {
      relevantDocuments.sort((a: any, b: any) => {
        let scoreA = a.similarity;
        let scoreB = b.similarity;
        
        // Appliquer des bonus selon le type de requête et les métadonnées
        if (a.metadata && b.metadata) {
          switch (queryType) {
            case 'factual':
              // Favoriser les définitions et les faits
              if (a.metadata.is_definition) scoreA += 0.1;
              if (b.metadata.is_definition) scoreB += 0.1;
              break;
              
            case 'procedural':
              // Favoriser les instructions par étapes
              if (a.metadata.contains_steps) scoreA += 0.15;
              if (b.metadata.contains_steps) scoreB += 0.15;
              break;
              
            case 'comparative':
              // Favoriser les comparaisons
              if (a.metadata.is_comparison) scoreA += 0.2;
              if (b.metadata.is_comparison) scoreB += 0.2;
              break;
          }
          
          // Favoriser les contenus plus récents pour certaines questions
          const isTimeSensitive = /récent|nouveau|dernier|actuel|aujourd'hui/i.test(query);
          if (isTimeSensitive && a.metadata.date && b.metadata.date) {
            const dateA = new Date(a.metadata.date);
            const dateB = new Date(b.metadata.date);
            if (dateA > dateB) scoreA += 0.05;
            if (dateB > dateA) scoreB += 0.05;
          }
        }
        
        return scoreB - scoreA;  // Tri décroissant
      });
    }
    
    // Limiter au nombre final de résultats
    relevantDocuments = relevantDocuments.slice(0, searchOptions.maxResults);
    
    // Étape 7: Construire le contexte pour le LLM
    let context = '';
    let sourceRefs = [];
    
    // Format du contexte selon le type de question
    if (relevantDocuments.length > 0) {
      if (queryType === 'factual' || queryType === 'general') {
        context = "Voici des informations pertinentes issues des documents:\n\n";
      } else if (queryType === 'procedural') {
        context = "Voici des instructions et procédures pertinentes issues des documents:\n\n";
      } else if (queryType === 'comparative') {
        context = "Voici des éléments de comparaison issus des documents:\n\n";
      } else if (queryType === 'conceptual') {
        context = "Voici des explications conceptuelles issues des documents:\n\n";
      }
      
      relevantDocuments.forEach((doc: any, i: number) => {
        const docRef = `[${i+1}]`;
        context += `${docRef} ${doc.content}\n\n`;
        
        if (doc.metadata) {
          sourceRefs.push({
            ref: docRef,
            title: doc.metadata.title || 'Document',
            source: doc.metadata.source || 'Source inconnue',
            date: doc.metadata.date || null
          });
        }
      });
    } else {
      context = "Aucune information pertinente trouvée dans les documents disponibles.";
    }
    
    // Étape 8: Générer la réponse avec le LLM
    const prompt = `
Tu es un assistant IA spécialisé dans l'analyse documentaire.

CONTEXTE:
${context}

QUESTION:
${query}

TYPE DE QUESTION:
${queryType}

INSTRUCTIONS:
- Réponds à la question en te basant principalement sur les informations fournies dans le contexte.
- Utilise uniquement les informations du contexte et tes connaissances générales si nécessaire.
- Si le contexte ne contient pas suffisamment d'informations, indique-le clairement.
- Pour les questions factuelles, donne des réponses précises basées sur les faits.
- Pour les questions procédurales, détaille les étapes de manière claire et ordonnée.
- Pour les questions comparatives, structure ta réponse en comparant explicitement les éléments.
- Pour les questions conceptuelles, explique les concepts en profondeur.
- Cite tes sources en utilisant les références numériques [X] lorsque tu utilises des informations spécifiques.

RÉPONSE:`;
    
    // Appeler le service de génération de texte
    const { data: llmResponse, error: llmError } = await supabase.functions.invoke(
      'text-generation',
      {
        body: {
          prompt: prompt,
          model: modelConfig.model,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens
        },
      }
    );
    
    if (llmError) {
      throw new Error(`Erreur lors de la génération de la réponse: ${llmError.message}`);
    }
    
    // Étape 9: Formater et retourner la réponse
    const result = {
      response: llmResponse?.results?.[0]?.generated_text || "Désolé, je n'ai pas pu générer une réponse.",
      context: relevantDocuments,
      sources: sourceRefs,
      query_type: queryType,
      metadata: {
        results_count: relevantDocuments.length,
        total_tokens_used: llmResponse?.metadata?.total_tokens || 0,
        processing_time: llmResponse?.metadata?.processing_time || 0
      }
    };
    
    // Stocker la réponse dans la conversation si un ID est fourni
    if (conversation_id) {
      const { error: conversationError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id,
          role: 'assistant',
          content: result.response,
          message_type: 'text',
          metadata: {
            sources: sourceRefs,
            query_type: queryType,
            total_tokens: llmResponse?.metadata?.total_tokens || 0
          }
        });
        
      if (conversationError) {
        console.error('Erreur lors de l\'enregistrement de la réponse:', conversationError);
      }
    }
    
    // Finaliser et retourner la réponse
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erreur:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors du traitement de la requête' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
