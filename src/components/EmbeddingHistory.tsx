
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmbeddingVersion {
  version: number;
  created_at: string;
  metadata: {
    chunk_index: number;
    updated_at: string;
  };
}

interface EmbeddingHistoryProps {
  documentId: string;
}

export const EmbeddingHistory = ({ documentId }: EmbeddingHistoryProps) => {
  const [versions, setVersions] = useState<EmbeddingVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('document_embeddings_versions')
        .select('version, created_at, metadata');

      if (error) throw error;
      
      // Explicitly type and transform the data
      const typedVersions: EmbeddingVersion[] = data?.map(item => ({
        version: item.version,
        created_at: item.created_at,
        metadata: item.metadata
      })) || [];
      
      setVersions(typedVersions);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (version: number) => {
    try {
      const { data: response, error } = await supabase
        .from('document_embeddings')
        .update({ version: version })
        .eq('document_id', documentId)
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Version ${version} restaurée avec succès`,
      });

      // Recharger les versions après la restauration
      await loadVersions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la version",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Historique des versions</h3>
      <div className="space-y-4">
        {versions.map((version) => (
          <div key={version.version} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Version {version.version}</p>
              <p className="text-sm text-gray-500">
                Créée le {new Date(version.created_at).toLocaleString()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => restoreVersion(version.version)}
            >
              Restaurer
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
