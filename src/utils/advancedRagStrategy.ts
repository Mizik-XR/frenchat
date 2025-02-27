
import { Json } from '@/types/database';

// Definir nos types pour les modèles RAG avancés
interface RagStrategyOptions {
  similarityThreshold: number;
  maxResults: number;
  useHybridSearch: boolean;
  chunkingStrategy: 'fixed' | 'semantic' | 'adaptive';
  reranking: boolean;
  embeddingModel: string;
}

interface QueryContext {
  queryType: 'factual' | 'conceptual' | 'procedural' | 'opinion';
  userHistory: string[];
  recentDocuments: string[];
  timeContext?: Date;
}

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
  sourceDocument: string;
  metadata: Record<string, any>;
}

// Implémentation de la stratégie avancée RAG
export class AdvancedRagStrategy {
  private options: RagStrategyOptions;
  private context: QueryContext | null = null;

  constructor(options?: Partial<RagStrategyOptions>) {
    // Valeurs par défaut pour les options
    this.options = {
      similarityThreshold: 0.75,
      maxResults: 5,
      useHybridSearch: true,
      chunkingStrategy: 'adaptive',
      reranking: true,
      embeddingModel: 'bge-large-en-v1.5',
      ...options
    };
  }

  // Définir le contexte de la requête
  setContext(context: QueryContext): void {
    this.context = context;
  }

  // Méthode pour classifier le type de requête
  classifyQuery(query: string): 'factual' | 'conceptual' | 'procedural' | 'opinion' {
    // Logique simple de classification basée sur des mots-clés
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.match(/comment|étape|procédure|faire|créer|implémenter|procéder/)) {
      return 'procedural';
    }
    if (lowercaseQuery.match(/qu'est-ce que|définir|expliquer|décrire|concept|théorie/)) {
      return 'conceptual';
    }
    if (lowercaseQuery.match(/penses-tu|opinion|avis|préférence|meilleur|pire|selon vous/)) {
      return 'opinion';
    }
    
    // Par défaut, on considère la requête comme factuelle
    return 'factual';
  }

  // Adaptation de la stratégie de recherche en fonction du type de requête
  adaptSearchStrategy(queryType: string): Partial<RagStrategyOptions> {
    switch (queryType) {
      case 'factual':
        return {
          similarityThreshold: 0.8,
          maxResults: 3,
          useHybridSearch: true
        };
      case 'conceptual':
        return {
          similarityThreshold: 0.7,
          maxResults: 5,
          useHybridSearch: false // Prioriser la recherche sémantique
        };
      case 'procedural':
        return {
          similarityThreshold: 0.75,
          maxResults: 6,
          useHybridSearch: true
        };
      case 'opinion':
        return {
          similarityThreshold: 0.65, // Plus permissif
          maxResults: 8,
          useHybridSearch: true
        };
      default:
        return {};
    }
  }

  // Extraction de mots-clés importants pour la recherche hybride
  extractKeywords(query: string): string {
    // Implémentation simple d'extraction de mots-clés
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'à', 'de', 'ce', 'cette', 'ces'];
    
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .join(' ');
  }

  // Reranking des résultats basé sur des critères multiples
  rerankResults(chunks: RetrievedChunk[], query: string): RetrievedChunk[] {
    if (!this.options.reranking) return chunks;
    
    // On doit conserver l'ordre original des résultats
    const rerankScores = chunks.map(chunk => {
      let score = chunk.similarity;
      
      // Bonus pour les documents récents
      if (chunk.metadata.createdAt) {
        const docDate = new Date(chunk.metadata.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 30) {
          score += 0.05; // Petit bonus pour les docs récents
        }
      }
      
      // Bonus pour les documents consultés récemment par l'utilisateur
      if (this.context?.recentDocuments.includes(chunk.sourceDocument)) {
        score += 0.1;
      }
      
      // Bonus pour la qualité du contenu (arbitraire pour l'exemple)
      if (chunk.content.length > 200) {
        score += 0.02; // Bonus pour les chunks substantiels
      }
      
      return { chunk, score };
    });
    
    // Trier par score et retourner les chunks
    return rerankScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.chunk);
  }

  // Génération de prompts adaptés au contexte
  generateEnhancedPrompt(query: string, chunks: RetrievedChunk[]): string {
    const queryType = this.context?.queryType || this.classifyQuery(query);
    const contextInfo = this.context ? 
      `\nBasé sur vos interactions précédentes et documents récemment consultés.` : '';
    
    let contextualPrompt: string;
    
    switch (queryType) {
      case 'factual':
        contextualPrompt = `Voici une question factuelle : "${query}"
Veuillez répondre de manière précise et concise en vous basant uniquement sur les informations suivantes :${contextInfo}`;
        break;
      case 'conceptual':
        contextualPrompt = `Voici une question conceptuelle : "${query}"
Veuillez expliquer ce concept de façon claire et structurée en vous basant sur les informations suivantes :${contextInfo}`;
        break;
      case 'procedural':
        contextualPrompt = `Voici une question de procédure : "${query}"
Veuillez expliquer les étapes à suivre de manière structurée en vous basant sur les informations suivantes :${contextInfo}`;
        break;
      case 'opinion':
        contextualPrompt = `Voici une demande d'opinion : "${query}"
Veuillez fournir une analyse équilibrée en vous basant sur les informations suivantes, en présentant différents points de vue si possible :${contextInfo}`;
        break;
      default:
        contextualPrompt = `Voici une question : "${query}"
Veuillez répondre en vous basant sur les informations suivantes :${contextInfo}`;
    }
    
    // Ajouter les extraits de documents au prompt
    const chunksContent = chunks
      .map((chunk, index) => {
        const source = chunk.metadata.title || chunk.sourceDocument || `Source ${index + 1}`;
        return `---\nExtrait de "${source}" (pertinence: ${Math.round(chunk.similarity * 100)}%):\n${chunk.content}\n---`;
      })
      .join('\n\n');
    
    return `${contextualPrompt}\n\n${chunksContent}\n\nRéponse:`;
  }
}

export default AdvancedRagStrategy;
