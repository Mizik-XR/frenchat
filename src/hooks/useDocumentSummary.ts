
import { useState, useEffect  } from '@/core/reactInstance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DocumentSummary {
  content: string | null;
}

export const useDocumentSummary = (documentId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('documents')
          .select('content')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        setSummary({ content: data?.content || null });
      } catch (error: any) {
        console.error('Error fetching document:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le document",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { documentId }
      });

      if (error) throw error;

      setSummary({ content: data.summary });
      
      toast({
        title: "Résumé généré",
        description: "Le résumé du document a été généré avec succès",
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé du document",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    summary,
    isLoading,
    isGenerating,
    generateSummary
  };
};
