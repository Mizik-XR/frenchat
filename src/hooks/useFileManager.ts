
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
      const { data, error } = await supabase
        .from('supported_mime_types')
        .select('enabled, description')
        .eq('mime_type', mimeType)
        .single();

      if (error) throw error;

      if (!data || !data.enabled) {
        toast({
          title: "Format non supporté",
          description: `Le format ${data?.description || mimeType} n'est pas supporté`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du type MIME:', error);
      return false;
    }
  };

  const validateFile = async (file: File) => {
    const { data } = await supabase.functions.invoke('manage-file-limits');
    
    if (!await checkMimeType(file.type)) {
      return false;
    }
    
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

    return true;
  };

  return {
    isLoading,
    stats,
    limits,
    checkFileLimits,
    validateFile,
    checkMimeType
  };
};
