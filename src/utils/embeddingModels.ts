
/**
 * Configuration et gestion des modèles d'embedding spécialisés
 */

export interface EmbeddingModel {
  id: string;
  name: string;
  provider: 'openai' | 'huggingface' | 'local' | 'other';
  dimensions: number;
  description: string;
  contextLength: number;
  isMultilingual: boolean;
  recommendedFor: string[];
  apiEndpoint?: string;
}

// Catalogue de modèles d'embedding de haute qualité
export const SPECIALIZED_EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'bge-large-en-v1.5',
    name: 'BGE Large English',
    provider: 'huggingface',
    dimensions: 1024,
    description: 'Performant pour la recherche sémantique en anglais',
    contextLength: 512,
    isMultilingual: false,
    recommendedFor: ['recherche_documentaire', 'question_reponse']
  },
  {
    id: 'bge-large-zh-v1.5',
    name: 'BGE Large Chinese',
    provider: 'huggingface',
    dimensions: 1024,
    description: 'Optimisé pour le chinois avec support multilingue',
    contextLength: 512,
    isMultilingual: true,
    recommendedFor: ['recherche_documentaire', 'multilingual']
  },
  {
    id: 'text-embedding-ada-002',
    name: 'OpenAI Ada 002',
    provider: 'openai',
    dimensions: 1536,
    description: 'Modèle performant d\'OpenAI pour embeddings textuels',
    contextLength: 8191,
    isMultilingual: true,
    recommendedFor: ['general', 'recherche_documentaire', 'classification']
  },
  {
    id: 'e5-large-v2',
    name: 'E5 Large v2',
    provider: 'huggingface',
    dimensions: 1024,
    description: 'Optimisé pour la recherche de passages',
    contextLength: 512,
    isMultilingual: false,
    recommendedFor: ['recherche_documentaire', 'similarite_semantique']
  },
  {
    id: 'instructor-xl',
    name: 'Instructor XL',
    provider: 'huggingface',
    dimensions: 768,
    description: 'Embarquable localement, très bon pour RAG',
    contextLength: 512,
    isMultilingual: false,
    recommendedFor: ['rag', 'local_deployment']
  },
  {
    id: 'jina-embeddings-v2-base-en',
    name: 'Jina Embeddings v2',
    provider: 'huggingface',
    dimensions: 768,
    description: 'Haute performance, particulièrement adapté pour RAG',
    contextLength: 8192,
    isMultilingual: false,
    recommendedFor: ['rag', 'recherche_documentaire', 'similarite_semantique']
  }
];

// Fonction pour obtenir le modèle recommandé selon l'usage
export function getRecommendedModel(usage: string): EmbeddingModel {
  const match = SPECIALIZED_EMBEDDING_MODELS.find(model => 
    model.recommendedFor.includes(usage)
  );
  
  return match || SPECIALIZED_EMBEDDING_MODELS[0]; // Default to first model if no match
}

// Fonction pour normaliser les vecteurs (améliore souvent la similarité cosinus)
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}
