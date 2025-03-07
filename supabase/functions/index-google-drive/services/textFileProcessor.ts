
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
