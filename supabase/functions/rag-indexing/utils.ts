
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength)
}

export function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/)
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}
