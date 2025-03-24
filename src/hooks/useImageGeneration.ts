
import { useState  } from '@/core/reactInstance';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useImageGeneration() {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateImage = async (input: string, type: 'illustration' | 'chart') => {
    if (!input.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une description pour générer une image",
        variant: "destructive"
      });
      return null;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: input,
          type
        }
      });

      if (error) throw error;

      return `${input}\n![${type === 'chart' ? 'Graphique' : 'Image'}](${data.image})`;
    } catch (error: any) {
      toast({
        title: "Erreur de génération",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGeneratingImage,
    handleGenerateImage
  };
}
