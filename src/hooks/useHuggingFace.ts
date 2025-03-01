
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface TextGenerationParameters {
  model: string;
  inputs: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
  };
  system_prompt?: string;
  max_length?: number;
  temperature?: number;
  top_p?: number;
  prompt?: string;
}

interface TextGenerationResponse {
  generated_text: string;
}

export function useHuggingFace(provider: string = 'huggingface') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<'local' | 'cloud'>(
    localStorage.getItem('aiServiceType') as 'local' | 'cloud' || 'cloud'
  );
  const [localAIUrl, setLocalAIUrl] = useState<string | null>(
    localStorage.getItem('localAIUrl') || null
  );

  // Écouter les changements de type de service
  useEffect(() => {
    const handleStorageChange = () => {
      setServiceType(localStorage.getItem('aiServiceType') as 'local' | 'cloud' || 'cloud');
      setLocalAIUrl(localStorage.getItem('localAIUrl'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fonction pour vérifier si le service local est disponible
  const checkLocalService = async (): Promise<boolean> => {
    if (!localAIUrl) return false;
    
    try {
      const response = await fetch(`${localAIUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout de 2 secondes
      });
      return response.ok;
    } catch (e) {
      console.warn("Service local indisponible:", e);
      return false;
    }
  };

  const textGeneration = async (options: TextGenerationParameters): Promise<TextGenerationResponse[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier d'abord si le service local est disponible si nous sommes en mode local
      if (serviceType === 'local') {
        const isLocalAvailable = await checkLocalService();
        
        if (isLocalAvailable && localAIUrl) {
          console.log("Utilisation du service IA local:", localAIUrl);
          
          // Préparer le système prompt si nécessaire
          const systemPrompt = options.system_prompt || 
            "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
          
          const response = await fetch(`${localAIUrl}/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: options.inputs || options.prompt,
              max_length: options.parameters?.max_length || options.max_length || 800,
              temperature: options.parameters?.temperature || options.temperature || 0.7,
              top_p: options.parameters?.top_p || options.top_p || 0.9,
              system_prompt: systemPrompt
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur du service local: ${response.status}`);
          }
          
          const data = await response.json();
          setIsLoading(false);
          return [{ generated_text: data.generated_text }];
        } else {
          console.warn("Service local indisponible, passage au service cloud");
          // Si le service local est indisponible, on passe automatiquement au service cloud
          localStorage.setItem('aiServiceType', 'cloud');
          setServiceType('cloud');
        }
      }
      
      // Si nous sommes ici, c'est que nous utilisons le service cloud
      console.log("Utilisation du service IA cloud via Supabase Functions");
      
      try {
        const { data, error } = await supabase.functions.invoke('text-generation', {
          body: { ...options, provider }
        });

        if (error) throw error;
        setIsLoading(false);
        return data.results;
      } catch (supabaseError) {
        console.warn("Échec de l'appel à la fonction Supabase, tentative avec le serveur cloud de secours", supabaseError);
        
        // Fallback à un serveur cloud de secours
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.filechat.app';
        
        // Préparer le système prompt si nécessaire
        const systemPrompt = options.system_prompt || 
          "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
        
        const response = await fetch(`${apiUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: options.inputs || options.prompt,
            max_length: options.parameters?.max_length || options.max_length || 800,
            temperature: options.parameters?.temperature || options.temperature || 0.7,
            top_p: options.parameters?.top_p || options.top_p || 0.9,
            system_prompt: systemPrompt
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const data = await response.json();
        return [{ generated_text: data.generated_text }];
      }
    } catch (e) {
      console.error("Erreur lors de l'appel au modèle:", e);
      setError(e instanceof Error ? e.message : String(e));
      
      // Notification à l'utilisateur
      toast({
        title: "Erreur de connexion au service d'IA",
        description: "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
        variant: "destructive"
      });
      
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    textGeneration, 
    isLoading, 
    error,
    serviceType,
    localAIUrl,
    checkLocalService
  };
}
