
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDocumentSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async (documentId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: "Résumé généré",
        description: "Le résumé du document a été généré avec succès.",
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
    isGenerating,
    generateSummary
  };
};
