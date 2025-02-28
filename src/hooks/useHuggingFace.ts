
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

export function useHuggingFace(provider: string = 'huggingface') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<'local' | 'cloud' | 'browser'>(() => {
    return localStorage.getItem('aiServiceType') as 'local' | 'cloud' | 'browser' || 'auto';
  });
  const [localAIUrl, setLocalAIUrl] = useState<string | null>(() => {
    return localStorage.getItem('localAIUrl') || 'http://localhost:8000';
  });
  
  // Vérifier si WebGPU est disponible (pour l'exécution directe dans le navigateur)
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(false);
  
  useEffect(() => {
    const checkWebGPU = async () => {
      // Vérifier si le navigateur supporte WebGPU
      if ('gpu' in navigator) {
        try {
          // @ts-ignore - L'API WebGPU peut ne pas être reconnue par TypeScript
          const adapter = await navigator.gpu.requestAdapter();
          setHasWebGPU(!!adapter);
          console.log("WebGPU disponible:", !!adapter);
        } catch (e) {
          console.log("WebGPU non disponible:", e);
          setHasWebGPU(false);
        }
      } else {
        setHasWebGPU(false);
      }
    };

    checkWebGPU();
  }, []);

  // Écouter les changements de type de service
  useEffect(() => {
    const handleStorageChange = () => {
      setServiceType(localStorage.getItem('aiServiceType') as 'local' | 'cloud' | 'browser' || 'auto');
      setLocalAIUrl(localStorage.getItem('localAIUrl'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fonction pour tester les différents services et sélectionner le meilleur automatiquement
  const detectBestService = useCallback(async (): Promise<'local' | 'cloud' | 'browser'> => {
    // Priorité 1: Serveur IA local
    if (localAIUrl) {
      try {
        const localAvailable = await checkLocalService();
        if (localAvailable) {
          console.log("Serveur IA local détecté");
          return 'local';
        }
      } catch (e) {
        console.log("Erreur lors de la vérification du serveur local:", e);
      }
    }
    
    // Priorité 2: WebGPU (exécution dans le navigateur)
    if (hasWebGPU) {
      console.log("WebGPU disponible, utilisation du mode navigateur");
      return 'browser';
    }
    
    // Fallback: Service cloud
    console.log("Aucun service local disponible, utilisation du cloud");
    return 'cloud';
  }, [localAIUrl, hasWebGPU]);

  // S'exécuter au démarrage et lorsque serviceType est 'auto'
  useEffect(() => {
    if (serviceType === 'auto') {
      detectBestService().then(bestService => {
        setServiceType(bestService);
        localStorage.setItem('aiServiceType', bestService);
        
        // Notification à l'utilisateur
        const serviceMessages = {
          'local': "Utilisation du serveur IA local pour de meilleures performances",
          'browser': "Utilisation de l'IA directement dans votre navigateur",
          'cloud': "Utilisation du service cloud d'IA"
        };
        
        toast({
          title: `Mode IA: ${bestService}`,
          description: serviceMessages[bestService]
        });
      });
    }
  }, [serviceType, detectBestService]);

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

  // Fonction pour exécuter le modèle directement dans le navigateur via Transformers.js
  const runBrowserModel = async (options: any) => {
    try {
      console.log("Exécution du modèle dans le navigateur avec Transformers.js");
      
      // Importer dynamiquement Transformers.js pour éviter de le charger si non utilisé
      const { pipeline } = await import("@huggingface/transformers");
      
      // Utiliser un modèle optimisé pour le navigateur
      const modelId = 'Xenova/distilgpt2' || options.model_id || 'Xenova/distilbert-base-uncased';
      
      const generator = await pipeline(
        'text-generation',
        modelId,
        { device: 'webgpu' }
      );
      
      const result = await generator(options.inputs || options.prompt, {
        max_length: options.parameters?.max_length || options.max_length || 800,
        temperature: options.parameters?.temperature || options.temperature || 0.7,
      });
      
      return [{ generated_text: result[0].generated_text }];
    } catch (error) {
      console.error("Erreur lors de l'exécution du modèle dans le navigateur:", error);
      throw error;
    }
  };

  const textGeneration = async (options: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Si mode automatique, détecter le meilleur service
      if (serviceType === 'auto') {
        const bestService = await detectBestService();
        setServiceType(bestService);
        localStorage.setItem('aiServiceType', bestService);
      }
      
      // Exécution locale via serveur API
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
          console.warn("Service local indisponible, passage au mode automatique");
          localStorage.setItem('aiServiceType', 'auto');
          setServiceType('auto');
          return textGeneration(options); // Rappel avec détection automatique
        }
      }
      
      // Exécution directe dans le navigateur
      if (serviceType === 'browser') {
        if (hasWebGPU) {
          try {
            const result = await runBrowserModel(options);
            setIsLoading(false);
            return result;
          } catch (browserError) {
            console.warn("Échec de l'exécution dans le navigateur, passage au cloud:", browserError);
            // Basculer en mode cloud temporairement pour cette requête
          }
        } else {
          console.warn("WebGPU non disponible, passage au cloud");
          // Continuer avec l'exécution cloud
        }
      }
      
      // Exécution via service cloud (fallback ou choix explicite)
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
    checkLocalService,
    hasWebGPU,
    detectBestService,
    setServiceType: (type: 'local' | 'cloud' | 'browser' | 'auto') => {
      localStorage.setItem('aiServiceType', type);
      setServiceType(type);
    }
  };
}
