
import { useState, useEffect } from 'react';
import { pipeline } from '@huggingface/transformers';
import { toast } from '@/hooks/use-toast';
import { AIProvider } from '@/types/chat';

export function useHuggingFace(aiProvider: AIProvider) {
  const [huggingFaceModel, setHuggingFaceModel] = useState<any>(null);

  useEffect(() => {
    const initHuggingFace = async () => {
      if (aiProvider === 'huggingface' && !huggingFaceModel) {
        try {
          toast({
            title: "Chargement du modèle",
            description: "Le modèle Hugging Face est en cours de chargement...",
          });

          const model = await pipeline(
            'text-generation',
            'mistral-7b-instruct-v0.2',
            { device: 'cpu' }
          );

          setHuggingFaceModel(model);
          
          toast({
            title: "Modèle chargé",
            description: "Le modèle Hugging Face est prêt à être utilisé !",
          });
        } catch (error) {
          console.error('Erreur lors du chargement du modèle:', error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger le modèle Hugging Face. Basculement vers OpenAI.",
            variant: "destructive"
          });
          return null;
        }
      }
    };

    initHuggingFace();
  }, [aiProvider]);

  return huggingFaceModel;
}
