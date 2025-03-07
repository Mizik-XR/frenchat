
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';

/**
 * Récupère le contenu d'un fichier texte
 */
export async function getFileContent(fileId: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Erreur lors de la récupération du contenu du fichier ${fileId}: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu du fichier ${fileId}:`, error);
    return null;
  }
}

/**
 * Traite un document Google et en extrait le texte
 */
export async function processGoogleDocument(fileId: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Erreur lors de la récupération du contenu du Google Doc ${fileId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const htmlContent = await response.text();
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    if (!doc) {
      console.error("Impossible de parser le contenu HTML du Google Doc");
      return null;
    }

    // Extraire le texte visible
    let textContent = doc.body?.textContent || '';

    // Nettoyer le texte (supprimer les espaces inutiles et les sauts de ligne)
    textContent = textContent.replace(/\s+/g, ' ').trim();

    return textContent;
  } catch (error) {
    console.error(`Erreur lors du traitement du Google Doc ${fileId}:`, error);
    return null;
  }
}
