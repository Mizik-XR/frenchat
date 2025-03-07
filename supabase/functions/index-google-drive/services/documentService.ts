
/**
 * Insère un document dans la base de données
 */
export async function insertUploadedDocument(
  supabase: any,
  userId: string,
  title: string,
  filePath: string,
  fileType: string,
  mimeType: string,
  size: number,
  metadata: any,
  content: string | null = null,
  previewUrl: string | null = null,
  contentHash: string | null = null
): Promise<any> {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .insert([
      {
        user_id: userId,
        title: title,
        file_path: filePath,
        file_type: fileType,
        mime_type: mimeType,
        size: size,
        metadata: metadata,
        content: content,
        preview_url: previewUrl,
        content_hash: contentHash
      },
    ])
    .select();

  if (error) {
    console.error('Erreur lors de l\'insertion du document uploadé:', error);
    throw new Error(`Erreur lors de l'insertion du document: ${error.message}`);
  }

  return data ? data[0] : null;
}
