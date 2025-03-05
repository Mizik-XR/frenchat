
/**
 * Utilitaire de découpage intelligent des documents pour l'indexation
 */

interface ChunkingOptions {
  minChunkSize: number;
  maxChunkSize: number;
  overlapSize: number;
  respectParagraphs: boolean;
  preserveHeaders: boolean;
  estimatedTokenFactor: number; // Estimation du nombre de tokens par caractère
}

export const defaultChunkingOptions: ChunkingOptions = {
  minChunkSize: 200, // Taille minimale d'un chunk en caractères
  maxChunkSize: 1500, // Taille maximale d'un chunk en caractères
  overlapSize: 100, // Taille du chevauchement entre chunks
  respectParagraphs: true, // Découper de préférence aux sauts de paragraphe
  preserveHeaders: true, // Conserver les en-têtes avec le contenu
  estimatedTokenFactor: 0.25 // Ratio moyen de tokens par caractère (~4 caractères = 1 token)
};

/**
 * Découpe un document en chunks intelligents
 */
export function chunkDocument(
  text: string,
  options: Partial<ChunkingOptions> = {}
): { chunks: string[], estimatedTokens: number[] } {
  // Fusion des options avec les valeurs par défaut
  const opts: ChunkingOptions = { ...defaultChunkingOptions, ...options };
  
  // Résultat
  const chunks: string[] = [];
  const estimatedTokens: number[] = [];
  
  // Si le texte est vide, retourner un tableau vide
  if (!text || text.trim().length === 0) {
    return { chunks, estimatedTokens };
  }
  
  // Prétraitement du texte: normaliser les sauts de ligne
  const normalizedText = text.replace(/\r\n/g, '\n');
  
  // Segmentation initiale par paragraphes si l'option est activée
  const segments = opts.respectParagraphs 
    ? normalizedText.split(/\n\s*\n/) 
    : [normalizedText];
  
  let currentChunk = '';
  let headers: string[] = [];
  
  // Traiter chaque segment
  for (const segment of segments) {
    // Détecter si le segment est un en-tête
    const isHeader = /^#+\s/.test(segment) || /^[A-Z0-9\s]{3,30}$/.test(segment);
    
    if (isHeader && opts.preserveHeaders) {
      headers.push(segment);
      continue;
    }
    
    // Si l'ajout du segment dépasse la taille maximale, on finalise le chunk actuel
    if (currentChunk.length + segment.length > opts.maxChunkSize && currentChunk.length >= opts.minChunkSize) {
      // Ajouter les en-têtes pertinents au début du chunk
      const finalChunk = headers.length > 0 && opts.preserveHeaders 
        ? headers.join('\n') + '\n\n' + currentChunk 
        : currentChunk;
      
      chunks.push(finalChunk);
      estimatedTokens.push(Math.ceil(finalChunk.length * opts.estimatedTokenFactor));
      
      // Réinitialiser le chunk avec un chevauchement
      const overlap = currentChunk.length > opts.overlapSize 
        ? currentChunk.slice(-opts.overlapSize) 
        : currentChunk;
      
      currentChunk = overlap + '\n' + segment;
    } else {
      // Ajouter le segment au chunk en cours
      currentChunk += (currentChunk ? '\n' : '') + segment;
    }
  }
  
  // Ajouter le dernier chunk s'il n'est pas vide
  if (currentChunk.trim().length > 0) {
    // Ajouter les en-têtes pertinents au début du chunk
    const finalChunk = headers.length > 0 && opts.preserveHeaders 
      ? headers.join('\n') + '\n\n' + currentChunk 
      : currentChunk;
    
    chunks.push(finalChunk);
    estimatedTokens.push(Math.ceil(finalChunk.length * opts.estimatedTokenFactor));
  }
  
  return { chunks, estimatedTokens };
}

/**
 * Estime le nombre de tokens dans un texte
 */
export function estimateTokenCount(text: string, factor: number = defaultChunkingOptions.estimatedTokenFactor): number {
  if (!text) return 0;
  return Math.ceil(text.length * factor);
}

/**
 * Tronque un texte pour ne pas dépasser un nombre maximal de tokens
 */
export function truncateToMaxTokens(text: string, maxTokens: number): string {
  const estimatedCharLimit = Math.floor(maxTokens / defaultChunkingOptions.estimatedTokenFactor);
  
  if (text.length <= estimatedCharLimit) {
    return text; // Déjà dans la limite
  }
  
  // Trouver un bon point de troncature (fin de phrase)
  const truncateAt = text.substring(0, estimatedCharLimit).lastIndexOf('.');
  if (truncateAt > estimatedCharLimit * 0.7) {
    return text.substring(0, truncateAt + 1);
  }
  
  // Si pas de point trouvé, tronquer à la fin d'un mot
  const wordTruncate = text.substring(0, estimatedCharLimit).lastIndexOf(' ');
  if (wordTruncate > 0) {
    return text.substring(0, wordTruncate) + '...';
  }
  
  // Dernier recours: troncature brute
  return text.substring(0, estimatedCharLimit) + '...';
}
