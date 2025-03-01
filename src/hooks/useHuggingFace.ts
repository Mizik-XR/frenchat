
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Types pour les types de service supportés
export type ServiceType = "local" | "cloud" | "browser";
export type ServiceTypeWithAuto = ServiceType | "auto";

export function useHuggingFace() {
  const [serviceType, setServiceType] = useState<ServiceTypeWithAuto>("auto");
  const [inferenceToken, setInferenceToken] = useState<string | null>(null);
  const [localAIUrl, setLocalAIUrl] = useState<string>("http://localhost:8000");
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(false);
  const [isLocalServerAvailable, setIsLocalServerAvailable] = useState<boolean>(false);

  // Vérifier si WebGPU est disponible
  useEffect(() => {
    const checkWebGPU = async () => {
      try {
        // @ts-ignore
        if ('gpu' in navigator) {
          try {
            // @ts-ignore
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
              setHasWebGPU(true);
              console.log("WebGPU est disponible");
            } else {
              setHasWebGPU(false);
              console.log("WebGPU n'est pas disponible (pas d'adaptateur)");
            }
          } catch (e) {
            setHasWebGPU(false);
            console.log("Erreur lors de la vérification de WebGPU:", e);
          }
        } else {
          setHasWebGPU(false);
          console.log("WebGPU n'est pas disponible (API non supportée)");
        }
      } catch (e) {
        setHasWebGPU(false);
        console.log("Exception lors de la vérification de WebGPU:", e);
      }
    };

    checkWebGPU();
  }, []);

  // Vérifier si un serveur AI local est disponible
  const checkLocalService = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${localAIUrl}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Serveur IA local détecté:", data);
        setIsLocalServerAvailable(true);
        return true;
      } else {
        console.log("Serveur IA local non disponible (réponse non-OK)");
        setIsLocalServerAvailable(false);
        return false;
      }
    } catch (e) {
      console.log("Erreur lors de la vérification du serveur IA local:", e);
      setIsLocalServerAvailable(false);
      return false;
    }
  };

  // Vérifier si un serveur AI local est disponible au chargement
  useEffect(() => {
    const checkServer = async () => {
      await checkLocalService();
      
      // Si en mode auto et serveur local détecté, utiliser local
      if (serviceType === 'auto') {
        selectBestServiceType();
      }
    };

    checkServer();
    
    // Vérifier périodiquement (toutes les 30 secondes)
    const interval = setInterval(checkServer, 30000);
    
    return () => clearInterval(interval);
  }, [localAIUrl, serviceType]);

  // Récupérer le token d'inférence Hugging Face
  useEffect(() => {
    const fetchInferenceToken = async () => {
      try {
        const { data, error } = await supabase
          .from('service_configurations')
          .select('config')
          .eq('service_name', 'huggingface')
          .single();

        if (error) {
          console.error("Erreur lors de la récupération du token HF:", error);
          return;
        }

        // Solution complètement simplifiée - traite config comme un objet générique
        if (data && typeof data.config === 'object' && data.config !== null) {
          // Accès direct à la propriété sans inférence de type complexe
          const config = data.config as any;
          const token = config.inference_token;
          
          if (typeof token === 'string') {
            setInferenceToken(token);
            console.log("Token HF récupéré avec succès");
          }
        }
      } catch (e) {
        console.error("Exception lors de la récupération du token HF:", e);
      }
    };

    fetchInferenceToken();
  }, []);

  // Sélectionner le meilleur type de service en fonction des capacités
  const selectBestServiceType = useCallback(() => {
    if (isLocalServerAvailable) {
      setActiveServiceType('local');
    } else if (hasWebGPU) {
      setActiveServiceType('browser');
    } else {
      setActiveServiceType('cloud');
    }
  }, [isLocalServerAvailable, hasWebGPU]);
  
  // Définir le type de service actif (pour le mode auto)
  const setActiveServiceType = (type: ServiceType) => {
    console.log(`Définition du type de service actif à: ${type}`);
    // On stocke le type effectif dans le localStorage
    localStorage.setItem('filechat_active_service_type', type);
  };
  
  // Obtenir le type de service effectif
  const getEffectiveServiceType = (): ServiceType => {
    if (serviceType !== 'auto') {
      return serviceType as ServiceType;
    }
    
    // En mode auto, on utilise le type stocké dans localStorage ou on sélectionne le meilleur
    const storedType = localStorage.getItem('filechat_active_service_type') as ServiceType | null;
    if (storedType && ['local', 'browser', 'cloud'].includes(storedType)) {
      return storedType;
    }
    
    // Déterminer le meilleur type de service
    if (isLocalServerAvailable) return 'local';
    if (hasWebGPU) return 'browser';
    return 'cloud';
  };

  // Fonction générique de génération de texte
  const textGeneration = async ({ model, inputs, parameters }: any) => {
    const effectiveType = getEffectiveServiceType();
    console.log(`Génération de texte avec le type de service: ${effectiveType}`);
    
    switch (effectiveType) {
      case 'local':
        return await localTextGeneration(inputs, parameters);
      case 'browser':
        return await browserTextGeneration(model, inputs, parameters);
      case 'cloud':
      default:
        return await cloudTextGeneration(model, inputs, parameters);
    }
  };

  // Génération de texte via le serveur IA local
  const localTextGeneration = async (prompt: string, parameters: any) => {
    try {
      const response = await fetch(`${localAIUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_length: parameters?.max_length || 800,
          temperature: parameters?.temperature || 0.7,
          top_p: parameters?.top_p || 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.statusText}`);
      }

      const data = await response.json();
      return [{ generated_text: data.generated_text }];
    } catch (error) {
      console.error("Erreur de génération locale:", error);
      toast({
        title: "Erreur de génération locale",
        description: "Basculement vers le service cloud...",
      });
      
      // En cas d'échec, basculer vers le cloud si en mode auto
      if (serviceType === 'auto') {
        setActiveServiceType('cloud');
        return await cloudTextGeneration("mistralai/Mistral-7B-Instruct-v0.1", prompt, parameters);
      }
      
      throw error;
    }
  };

  // Génération de texte via API Hugging Face
  const cloudTextGeneration = async (model: string, inputs: string, parameters: any) => {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${inferenceToken}`,
          },
          body: JSON.stringify({
            inputs,
            parameters,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur de génération cloud:", error);
      
      // En cas d'échec, basculer vers le navigateur si en mode auto et WebGPU disponible
      if (serviceType === 'auto' && hasWebGPU) {
        setActiveServiceType('browser');
        return await browserTextGeneration(model, inputs, parameters);
      }
      
      throw error;
    }
  };

  // Génération de texte dans le navigateur avec Transformers.js
  const browserTextGeneration = async (model: string, inputs: string, parameters: any) => {
    try {
      // Simuler une réponse pour le moment
      // Dans la vraie implémentation, on utiliserait Transformers.js
      console.log("Génération de texte dans le navigateur avec Transformers.js");
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return [{ 
        generated_text: "Ceci est une réponse générée dans le navigateur avec Transformers.js. " +
                       "Pour une véritable implémentation, vous devriez intégrer la bibliothèque et " +
                       "charger le modèle approprié." 
      }];
    } catch (error) {
      console.error("Erreur de génération dans le navigateur:", error);
      
      // En cas d'échec, basculer vers le cloud si en mode auto
      if (serviceType === 'auto') {
        setActiveServiceType('cloud');
        return await cloudTextGeneration(model, inputs, parameters);
      }
      
      throw error;
    }
  };

  return {
    serviceType,
    inferenceToken,
    hasWebGPU,
    isLocalServerAvailable,
    localAIUrl,
    textGeneration,
    changeServiceType: setServiceType,
    getEffectiveServiceType,
    checkLocalService,
    setServiceType
  };
}
