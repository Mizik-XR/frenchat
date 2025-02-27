
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

export interface RetrievalOptions {
  k: number;                       // Nombre de résultats à retourner
  threshold: number;               // Seuil de similarité minimum
  useHybrid: boolean;              // Utiliser la recherche hybride
  diversify: boolean;              // Diversifier les résultats
  filterMetadata?: Record<string, any>; // Filtres sur les métadonnées
}

export const defaultRagQueryOptions: RagQueryOptions = {
  useHybridSearch: true,
  useQueryClassification: true,
  enhanceWithMetadata: true,
  minSimilarityThreshold: 0.7,
  maxResults: 5,
  reranking: true
};

export const defaultRetrievalOptions: RetrievalOptions = {
  k: 5,
  threshold: 0.7,
  useHybrid: true,
  diversify: true
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
 * Recherche sémantique utilisant les embeddings
 */
export async function performSemanticSearch(
  question: string, 
  embedding: number[],
  limit: number = 5,
  threshold: number = 0.7
) {
  const normalizedEmbedding = normalizeVector(embedding);
  
  try {
    const { data, error } = await supabase.rpc(
      'search_documents',
      {
        query_embedding: normalizedEmbedding,
        match_threshold: threshold,
        match_count: limit
      }
    );
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche sémantique:', error);
    throw error;
  }
}

/**
 * Recherche par mots-clés utilisant la recherche full-text
 */
export async function performKeywordSearch(
  keywords: string[],
  limit: number = 5
) {
  if (!keywords.length) return [];
  
  try {
    // Construire une requête fulltext search
    const keywordQuery = keywords.join(' & ');
    
    const { data, error } = await supabase
      .from('document_chunks')
      .select('*, metadata')
      .textSearch('content', keywordQuery)
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche par mots-clés:', error);
    throw error;
  }
}

/**
 * Diversifie les résultats pour éviter la redondance
 * Utilise une mesure de distance pour sélectionner des résultats variés
 */
export function diversifyResults(results: any[], count: number = 5): any[] {
  if (results.length <= count) return results;
  
  const selected: any[] = [results[0]]; // Toujours inclure le premier résultat (le plus pertinent)
  const remainingCandidates = results.slice(1);
  
  while (selected.length < count && remainingCandidates.length > 0) {
    // Calculer la diversité (distance minimale aux résultats déjà sélectionnés)
    const diversityScores = remainingCandidates.map(candidate => {
      // Calculer la distance minimale aux résultats déjà sélectionnés
      const minDistance = Math.min(...selected.map(item => 
        // Distance simple basée sur le contenu textuel (peut être améliorée)
        calculateTextualDistance(candidate.content, item.content)
      ));
      return { candidate, diversityScore: minDistance };
    });
    
    // Sélectionner le candidat avec le meilleur score de diversité
    diversityScores.sort((a, b) => b.diversityScore - a.diversityScore);
    const nextBest = diversityScores[0].candidate;
    
    // Ajouter à la sélection et retirer des candidats
    selected.push(nextBest);
    remainingCandidates.splice(
      remainingCandidates.findIndex(c => c.id === nextBest.id),
      1
    );
  }
  
  return selected;
}

/**
 * Calcule une mesure de distance simple entre deux textes
 * Cette implémentation basique peut être améliorée pour de meilleurs résultats
 */
function calculateTextualDistance(text1: string, text2: string): number {
  // Extraire les mots de chaque texte
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  // Calculer Jaccard distance: 1 - (intersection / union)
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  // Distance: 0 = identiques, 1 = complètement différents
  return 1 - (intersection.size / union.size);
}

/**
 * Combine et réordonne les résultats de différentes sources de recherche
 */
export function mergeAndReorderResults(
  semanticResults: any[],
  keywordResults: any[],
  limit: number = 5
): any[] {
  // Créer une map pour dédupliquer par ID
  const resultMap = new Map();
  
  // Ajouter les résultats sémantiques avec un score de base élevé
  semanticResults.forEach(result => {
    resultMap.set(result.id, {
      ...result,
      combinedScore: result.similarity * 0.7 // 70% du poids aux résultats sémantiques
    });
  });
  
  // Ajouter ou mettre à jour avec les résultats par mots-clés
  keywordResults.forEach(result => {
    if (resultMap.has(result.id)) {
      // Si déjà présent, augmenter le score combiné
      const existingEntry = resultMap.get(result.id);
      existingEntry.combinedScore += 0.3; // Bonus pour les résultats trouvés par les deux méthodes
    } else {
      // Sinon, ajouter avec un score de base différent
      resultMap.set(result.id, {
        ...result,
        similarity: result.similarity || 0.6, // Score par défaut si non présent
        combinedScore: 0.3 // 30% du poids aux résultats par mots-clés
      });
    }
  });
  
  // Convertir en tableau et trier par score combiné
  const combinedResults = Array.from(resultMap.values());
  combinedResults.sort((a, b) => b.combinedScore - a.combinedScore);
  
  // Retourner les meilleurs résultats
  return combinedResults.slice(0, limit);
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
    const semanticResults = await performSemanticSearch(
      question,
      normalizedEmbedding,
      opts.maxResults * 2,
      opts.minSimilarityThreshold
    );
    
    // 2. Si activé, enrichir avec une recherche par mots-clés
    let keywordResults = [];
    if (opts.useHybridSearch) {
      const keywords = extractKeywords(question);
      if (keywords.length > 0) {
        keywordResults = await performKeywordSearch(keywords, opts.maxResults);
      }
    }
    
    // 3. Fusionner et classer les résultats
    let combinedResults = mergeAndReorderResults(
      semanticResults,
      keywordResults,
      opts.maxResults * 2
    );
    
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
 * Stratégie de récupération avancée qui s'adapte au type de question
 */
export async function enhancedRetrieval(
  query: string, 
  embedding: number[],
  options: Partial<RetrievalOptions> = {}
) {
  const opts = { ...defaultRetrievalOptions, ...options };
  
  // Classifier la question pour déterminer la stratégie optimale
  const questionType = classifyQuestion(query);
  
  // Stratégie de base: recherche sémantique
  const semanticResults = await performSemanticSearch(
    query,
    embedding,
    opts.k * 2,
    opts.threshold
  );
  
  if (!semanticResults.length) return [];
  
  if (questionType === 'factual' && opts.useHybrid) {
    // Pour les questions factuelles, ajouter des filtres exacts
    const keywords = extractKeywords(query);
    const keywordResults = await performKeywordSearch(keywords, opts.k);
    
    // Combiner et réordonner les résultats avec une stratégie de fusion
    return mergeAndReorderResults(semanticResults, keywordResults, opts.k);
  }
  
  if (questionType === 'conceptual' && opts.diversify) {
    // Pour les questions conceptuelles, privilégier la diversité sémantique
    return diversifyResults(semanticResults, opts.k);
  }
  
  // Appliquer les filtres de métadonnées si spécifiés
  if (opts.filterMetadata && Object.keys(opts.filterMetadata).length > 0) {
    return semanticResults
      .filter(result => {
        if (!result.metadata) return false;
        
        // Vérifier que chaque filtre correspond
        return Object.entries(opts.filterMetadata || {}).every(([key, value]) => {
          return result.metadata[key] === value;
        });
      })
      .slice(0, opts.k);
  }
  
  return semanticResults.slice(0, opts.k);
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
