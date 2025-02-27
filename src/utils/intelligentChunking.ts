
/**
 * Utilitaire pour le chunking intelligent des documents
 * Permet de découper les documents selon leur structure sémantique plutôt que par nombre fixe de tokens
 */

interface ChunkingOptions {
  // Taille maximale des chunks en tokens
  maxChunkSize: number;
  // Taille du chevauchement entre chunks voisins
  overlapSize: number;
  // Utiliser la détection de structure sémantique
  useSemanticStructure: boolean;
  // Respect des délimiteurs de structure (paragraphes, titres)
  respectStructure: boolean;
}

const defaultChunkingOptions: ChunkingOptions = {
  maxChunkSize: 1000,
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
 * Détecte les points de séparation structurels dans un texte
 */
export function detectStructuralBreakpoints(text: string): number[] {
  const breakpoints: number[] = [];
  
  // Ajouter le début et la fin comme points de séparation
  breakpoints.push(0);
  
  // Détecter les titres et sections
  for (const pattern of SECTION_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      breakpoints.push(match.index);
    }
  }
  
  // Détecter les paragraphes
  for (const delimiter of PARAGRAPH_DELIMITERS) {
    let position = 0;
    while ((position = text.indexOf(delimiter, position)) !== -1) {
      breakpoints.push(position);
      position += delimiter.length;
    }
  }
  
  // Ajouter la fin comme point de séparation
  breakpoints.push(text.length);
  
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
    
    // Ajouter le dernier chunk
    if (currentChunk) {
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
    
    // Ajouter le dernier chunk
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  }
  
  return chunks;
}
