
import { useState  } from '@/core/reactInstance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type OutputFormat = 'document' | 'presentation' | 'spreadsheet';
export type Destination = 'preview' | 'google_drive' | 'microsoft_teams';

interface SynthesisOptions {
  query: string;
  sourceDocuments: string[];
  outputFormat: OutputFormat;
  destination: Destination;
}

export function useDocumentSynthesis() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const generateDocument = async (options: SynthesisOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-synthesis', {
        body: options
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Document généré",
        description: "Le document a été généré avec succès",
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDocument,
    isGenerating,
    generatedContent
  };
}
