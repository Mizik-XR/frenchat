
/**
 * Utilitaire pour le chunking intelligent des documents
 * Permet de découper les documents selon leur structure sémantique plutôt que par nombre fixe de tokens
 */

interface ChunkingOptions {
  // Taille maximale des chunks en tokens
  maxChunkSize: number;
  // Taille minimale des chunks en tokens (pour éviter les chunks trop petits)
  minChunkSize?: number;
  // Taille du chevauchement entre chunks voisins
  overlapSize: number;
  // Utiliser la détection de structure sémantique
  useSemanticStructure: boolean;
  // Respect des délimiteurs de structure (paragraphes, titres)
  respectStructure: boolean;
}

const defaultChunkingOptions: ChunkingOptions = {
  maxChunkSize: 1000,
  minChunkSize: 50,
  overlapSize: 200,
  useSemanticStructure: true,
  respectStructure: true
};

// Détecteurs de structures sémantiques dans le texte
const SECTION_PATTERNS = [
  /^#+\s+.+$/gm, // Titres markdown
  /^[A-Z][\w\s]+:$/gm, // Titres suivis de deux-points
  /^\d+\.\s+[A-Z][\w\s]+$/gm, // Titres numérotés
  /^[IVX]+\.\s+[A-Z][\w\s]+$/gm, // Titres avec numérotation romaine
];

const PARAGRAPH_DELIMITERS = [
  "\n\n",
  "\r\n\r\n",
  "\n\r\n\r",
  "\n\t\n"
];

/**
 * Détecte les titres dans un document
 */
export function detectHeadings(text: string): number[] {
  const headingPositions: number[] = [];
  
  for (const pattern of SECTION_PATTERNS) {
    let match;
    // On doit réinitialiser le pattern à chaque utilisation pour éviter les problèmes avec lastIndex
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      headingPositions.push(match.index);
    }
  }
  
  return headingPositions.sort((a, b) => a - b);
}

/**
 * Détecte les limites de paragraphes dans un document
 */
export function detectParagraphBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  
  // Ajouter le début comme point de séparation
  boundaries.push(0);
  
  // Détecter les paragraphes
  for (const delimiter of PARAGRAPH_DELIMITERS) {
    let position = 0;
    while ((position = text.indexOf(delimiter, position)) !== -1) {
      boundaries.push(position);
      position += delimiter.length;
    }
  }
  
  return boundaries.sort((a, b) => a - b);
}

/**
 * Détecte les points de séparation structurels dans un texte
 */
export function detectStructuralBreakpoints(text: string): number[] {
  const headings = detectHeadings(text);
  const paragraphBoundaries = detectParagraphBoundaries(text);
  
  // Ajouter la fin comme point de séparation
  const breakpoints = [...headings, ...paragraphBoundaries, text.length];
  
  // Trier et dédupliquer
  return [...new Set(breakpoints)].sort((a, b) => a - b);
}

/**
 * Estime le nombre de tokens dans un texte
 * Estimation simple: ~1.3 tokens par mot
 */
function estimateTokenCount(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.3);
}

/**
 * Divise un texte en chunks intelligents selon la structure sémantique
 */
export function chunkTextIntelligently(
  text: string, 
  options: Partial<ChunkingOptions> = {}
): string[] {
  const opts: ChunkingOptions = { ...defaultChunkingOptions, ...options };
  const chunks: string[] = [];
  
  if (!text || text.length === 0) return chunks;
  
  if (opts.useSemanticStructure) {
    // Chunking basé sur la structure sémantique
    const breakpoints = detectStructuralBreakpoints(text);
    
    let currentChunk = "";
    let startIndex = 0;
    
    for (let i = 1; i < breakpoints.length; i++) {
      const section = text.substring(breakpoints[i-1], breakpoints[i]);
      const sectionTokenCount = estimateTokenCount(section);
      
      // Vérification si cette section à elle seule dépasse la taille maximale
      // Dans ce cas, on utilise un chunking basé sur les mots
      if (sectionTokenCount > opts.maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        
        // Chunking de la section trop grande
        const sectionChunks = chunkLargeSection(section, opts);
        chunks.push(...sectionChunks);
        continue;
      }
      
      // Si l'ajout de cette section dépasse la taille maximale, on crée un nouveau chunk
      if (estimateTokenCount(currentChunk + section) > opts.maxChunkSize && currentChunk !== "") {
        chunks.push(currentChunk);
        
        // Ajouter du chevauchement si nécessaire
        if (opts.overlapSize > 0 && currentChunk.length > opts.overlapSize) {
          const overlapText = currentChunk.substring(currentChunk.length - opts.overlapSize);
          currentChunk = overlapText;
        } else {
          currentChunk = "";
        }
      }
      
      currentChunk += section;
    }
    
    // Ajouter le dernier chunk s'il est assez grand
    if (currentChunk && (!opts.minChunkSize || estimateTokenCount(currentChunk) >= opts.minChunkSize)) {
      chunks.push(currentChunk);
    }
  } else {
    // Fallback sur le chunking basé sur la taille fixe (algorithme classique)
    let currentChunk = "";
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (estimateTokenCount(currentChunk + " " + word) > opts.maxChunkSize && currentChunk !== "") {
        chunks.push(currentChunk);
        
        // Ajouter du chevauchement si nécessaire
        if (opts.overlapSize > 0 && currentChunk.length > opts.overlapSize) {
          const overlapText = currentChunk.substring(currentChunk.length - opts.overlapSize);
          currentChunk = overlapText;
        } else {
          currentChunk = "";
        }
      }
      
      currentChunk += (currentChunk ? " " : "") + word;
    }
    
    // Ajouter le dernier chunk s'il est assez grand
    if (currentChunk && (!opts.minChunkSize || estimateTokenCount(currentChunk) >= opts.minChunkSize)) {
      chunks.push(currentChunk);
    }
  }
  
  return chunks;
}

/**
 * Chunking d'une section trop grande en utilisant une approche basée sur les mots
 */
function chunkLargeSection(text: string, options: ChunkingOptions): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  const words = text.split(/\s+/);
  
  for (const word of words) {
    if (estimateTokenCount(currentChunk + " " + word) > options.maxChunkSize && currentChunk !== "") {
      chunks.push(currentChunk);
      
      // Ajouter du chevauchement si nécessaire
      if (options.overlapSize > 0 && currentChunk.length > options.overlapSize) {
        const overlapText = currentChunk.substring(currentChunk.length - options.overlapSize);
        currentChunk = overlapText;
      } else {
        currentChunk = "";
      }
    }
    
    currentChunk += (currentChunk ? " " : "") + word;
  }
  
  // Ajouter le dernier chunk s'il est assez grand
  if (currentChunk && (!options.minChunkSize || estimateTokenCount(currentChunk) >= options.minChunkSize)) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
