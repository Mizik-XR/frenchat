
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileStats {
  totalFiles: number;
  totalSize: number;
}

interface FileLimits {
  maxFiles: number;
  maxFileSize: number;
  maxTotalSize: number;
}

interface FileMetadata {
  id: string;
  content_hash: string;
  path: string;
}

export const useFileManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [limits, setLimits] = useState<FileLimits | null>(null);

  const checkFileLimits = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('manage-file-limits');
      
      if (error) throw error;
      
      setStats(data.stats);
      setLimits(data.limits);
      
      return {
        canUpload: data.canAddMore,
        remainingFiles: data.remainingFiles,
        remainingSize: data.remainingSize
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des limites:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les limites de fichiers",
        variant: "destructive"
      });
      return { canUpload: false, remainingFiles: 0, remainingSize: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  const checkMimeType = async (mimeType: string): Promise<boolean> => {
    try {
      console.log('Vérification du type MIME:', mimeType);
      const { data, error } = await supabase
        .from('supported_mime_types')
        .select('enabled, description, category')
        .eq('mime_type', mimeType)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du type MIME:', error);
        throw error;
      }

      if (!data || !data.enabled) {
        const description = data?.description || mimeType;
        const category = data?.category || 'inconnu';
        toast({
          title: "Format non supporté",
          description: `Le format ${description} (${category}) n'est pas supporté`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Type MIME validé:', data);
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du type MIME:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le format du fichier",
        variant: "destructive"
      });
      return false;
    }
  };

  const validateFile = async (file: File) => {
    console.log('Validation du fichier:', file.name, file.type);
    
    if (!await checkMimeType(file.type)) {
      return false;
    }
    
    const { data } = await supabase.functions.invoke('manage-file-limits');
    
    if (file.size > data.limits.maxFileSize) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale autorisée est de ${Math.round(data.limits.maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive"
      });
      return false;
    }

    if (!data.canAddMore) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint le nombre maximum de fichiers autorisés",
        variant: "destructive"
      });
      return false;
    }

    console.log('Fichier validé avec succès');
    return true;
  };

  const updateFileIndex = async (fileId: string, newHash: string) => {
    try {
      console.log(`Mise à jour de l'index pour le fichier ${fileId}`);
      const { data: file } = await supabase
        .from('uploaded_documents')
        .select('content_hash, path')
        .eq('id', fileId)
        .single();

      if (!file) {
        throw new Error('Fichier non trouvé');
      }

      if (file.content_hash !== newHash) {
        console.log('Changement détecté, ré-indexation en cours...');
        await supabase.functions.invoke('process-uploaded-files', {
          body: { fileId, path: file.path }
        });

        await supabase
          .from('uploaded_documents')
          .update({ content_hash: newHash })
          .eq('id', fileId);

        toast({
          title: "Mise à jour réussie",
          description: "Le fichier a été ré-indexé avec succès"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'index:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'index du fichier",
        variant: "destructive"
      });
    }
  };

  const deleteFileIndex = async (fileId: string) => {
    try {
      console.log(`Suppression de l'index pour le fichier ${fileId}`);
      
      // Suppression des chunks de document
      await supabase
        .from('document_chunks')
        .delete()
        .match({ file_id: fileId });

      // Suppression des embeddings
      await supabase
        .from('document_embeddings')
        .delete()
        .match({ file_id: fileId });

      // Suppression du document
      await supabase
        .from('uploaded_documents')
        .delete()
        .match({ id: fileId });

      toast({
        title: "Suppression réussie",
        description: "Le fichier et ses données associées ont été supprimés"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'index:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données du fichier",
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    stats,
    limits,
    checkFileLimits,
    validateFile,
    checkMimeType,
    updateFileIndex,
    deleteFileIndex
  };
};
