
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface EmbeddingVersion {
  version: number;
  created_at: string;
  metadata: {
    updated_at: string;
    chunk_index: number;
  };
}

interface EmbeddingHistoryProps {
  documentId: string;
}

// Helper function to validate metadata structure
const isValidMetadata = (metadata: Json): metadata is EmbeddingVersion['metadata'] => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  const meta = metadata as Record<string, unknown>;
  return (
    typeof meta.updated_at === 'string' &&
    typeof meta.chunk_index === 'number'
  );
};

export const EmbeddingHistory = ({ documentId }: EmbeddingHistoryProps) => {
  const [versions, setVersions] = useState<EmbeddingVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_embeddings_versions')
        .select('version, created_at, metadata')
        .eq('document_id', documentId)
        .order('version', { ascending: false });

      if (error) throw error;
      
      const typedVersions: EmbeddingVersion[] = (data || [])
        .filter(item => isValidMetadata(item.metadata))
        .map(item => ({
          version: item.version,
          created_at: item.created_at,
          metadata: item.metadata as EmbeddingVersion['metadata']
        }));
      
      setVersions(typedVersions);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des versions",
        variant: "destructive",
      });
      console.error("Error loading versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreVersion = async (version: number) => {
    try {
      const { data, error } = await supabase
        .rpc('restore_embedding_version', {
          p_document_id: documentId,
          p_version: version
        });

      if (error) throw error;

      if (data) {
        toast({
          title: "Succès",
          description: `Version ${version} restaurée avec succès`,
        });
        await loadVersions(); // Recharger les versions après la restauration
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de restaurer cette version",
        variant: "destructive",
      });
      console.error("Error restoring version:", error);
    }
  };

  if (isLoading) {
    return <div>Chargement de l'historique...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Historique des versions</h3>
      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.version}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div>
              <div className="font-medium">Version {version.version}</div>
              <div className="text-sm text-gray-500">
                Créée le {new Date(version.created_at).toLocaleDateString()}
              </div>
              {version.metadata && (
                <div className="text-sm text-gray-500">
                  Chunk {version.metadata.chunk_index}
                </div>
              )}
            </div>
            <button
              onClick={() => restoreVersion(version.version)}
              className="px-3 py-1 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors"
            >
              Restaurer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
