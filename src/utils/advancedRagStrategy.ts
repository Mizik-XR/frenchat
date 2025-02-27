
/**
 * Stratégies avancées pour les requêtes RAG
 * Implémente un système hybride de recherche et classification automatique
 */

import { normalizeVector } from './embeddingModels';
import { supabase } from "@/integrations/supabase/client";

export type QueryType = 'factual' | 'conceptual' | 'procedural' | 'comparative' | 'general';

export interface RagQueryOptions {
  useHybridSearch: boolean;        // Combinaison recherche sémantique + mots-clés
  useQueryClassification: boolean; // Classification automatique de la question
  enhanceWithMetadata: boolean;    // Utiliser les métadonnées pour filtrer/trier
  minSimilarityThreshold: number;  // Seuil minimum de similarité (0-1)
  maxResults: number;              // Nombre maximum de résultats
  reranking: boolean;              // Réorganiser les résultats après récupération
}

export const defaultRagQueryOptions: RagQueryOptions = {
  useHybridSearch: true,
  useQueryClassification: true,
  enhanceWithMetadata: true,
  minSimilarityThreshold: 0.7,
  maxResults: 5,
  reranking: true
};

// Patterns pour la classification des questions
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

/**
 * Classifie une question selon son type
 */
export function classifyQuestion(question: string): QueryType {
  for (const [type, patterns] of Object.entries(QUESTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(question)) {
        return type as QueryType;
      }
    }
  }
  
  return 'general';
}

/**
 * Extrait les mots-clés importants d'une question
 */
export function extractKeywords(text: string): string[] {
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

/**
 * Exécute une recherche hybride combinant embeddings et mots-clés
 */
export async function performHybridSearch(
  questionEmbedding: number[],
  question: string,
  options: Partial<RagQueryOptions> = {}
) {
  const opts = { ...defaultRagQueryOptions, ...options };
  const queryType = opts.useQueryClassification ? classifyQuestion(question) : 'general';
  
  // Normaliser l'embedding pour de meilleurs résultats de similarité
  const normalizedEmbedding = normalizeVector(questionEmbedding);
  
  try {
    // 1. Recherche vectorielle basée sur les embeddings
    const { data: semanticResults, error: semanticError } = await supabase.rpc(
      'search_documents',
      {
        query_embedding: normalizedEmbedding,
        match_threshold: opts.minSimilarityThreshold,
        match_count: opts.maxResults * 2  // On récupère plus pour le filtrage ultérieur
      }
    );
    
    if (semanticError) throw semanticError;
    
    // 2. Si activé, enrichir avec une recherche par mots-clés
    let keywordResults = [];
    if (opts.useHybridSearch) {
      const keywords = extractKeywords(question);
      
      if (keywords.length > 0) {
        // Construire une requête fulltext search
        const keywordQuery = keywords.join(' & ');
        
        const { data: keywordData, error: keywordError } = await supabase
          .from('document_chunks')
          .select('*, metadata')
          .textSearch('content', keywordQuery)
          .limit(opts.maxResults);
          
        if (!keywordError && keywordData) {
          keywordResults = keywordData;
        }
      }
    }
    
    // 3. Fusionner et classer les résultats
    let combinedResults = [...semanticResults];
    
    // Ajouter les résultats par mots-clés non déjà présents
    const existingIds = new Set(semanticResults.map(r => r.id));
    for (const result of keywordResults) {
      if (!existingIds.has(result.id)) {
        combinedResults.push({
          ...result,
          similarity: 0.6  // Score par défaut pour les résultats par mots-clés
        });
      }
    }
    
    // 4. Réorganiser les résultats selon le type de question si activé
    if (opts.reranking) {
      combinedResults = rerankResultsByQueryType(combinedResults, queryType);
    }
    
    // 5. Limiter au nombre de résultats demandé
    return combinedResults.slice(0, opts.maxResults);
    
  } catch (error) {
    console.error('Erreur lors de la recherche hybride:', error);
    throw error;
  }
}

/**
 * Réorganise les résultats en fonction du type de question
 */
function rerankResultsByQueryType(results: any[], queryType: QueryType) {
  return results.sort((a, b) => {
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
      const isTimeSensitive = /récent|nouveau|dernier|actuel|aujourd'hui/i.test(queryType);
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
