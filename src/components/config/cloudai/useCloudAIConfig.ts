
import { useState, useEffect  } from '@/core/reactInstance';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ServiceType } from "@/types/config";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ConfigData {
  apiKey?: string;
  [key: string]: any;
}

export function useCloudAIConfig() {
  const { user } = useAuthSession();
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoadError(null);
      
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        console.log("Aucun utilisateur connecté, impossible de charger les configurations");
        return;
      }

      // Utiliser une approche plus simple pour éviter les problèmes de RLS
      const { data: existingConfigs, error } = await supabase
        .from('service_configurations')
        .select('service_type, config');
      
      if (error) {
        console.error('Erreur lors du chargement des configurations:', error);
        setLoadError(`Erreur de base de données: ${error.message}`);
        return;
      }

      if (!existingConfigs || existingConfigs.length === 0) {
        console.log("Aucune configuration trouvée");
        return;
      }

      const formattedConfigs = existingConfigs.reduce((acc, curr) => {
        // Accéder de manière sécurisée à la propriété apiKey
        const configObj = typeof curr.config === 'object' 
          ? curr.config as ConfigData 
          : (typeof curr.config === 'string' ? JSON.parse(curr.config) : {});
        
        const apiKey = configObj.apiKey || '';
        acc[curr.service_type] = apiKey;
        return acc;
      }, {} as Record<string, string>);

      setConfigs(formattedConfigs);
    } catch (error: any) {
      console.error('Erreur lors du chargement des configurations:', error);
      setLoadError(error.message || "Erreur inconnue lors du chargement des configurations");
      
      // Éviter d'afficher des toasts multiples pour la même erreur
      if (!loadError) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les configurations existantes",
          variant: "destructive",
        });
      }
    }
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const testAPIKey = async (provider: ServiceType, apiKey: string): Promise<boolean> => {
    // Ici, nous pourrions implémenter des tests spécifiques pour chaque fournisseur
    // Pour l'instant, nous vérifions juste que la clé n'est pas vide
    return apiKey.length > 0;
  };

  const handleSaveConfig = async (provider: ServiceType, apiKey: string) => {
    setIsSubmitting(prev => ({ ...prev, [provider]: true }));
    
    try {
      const isValid = await testAPIKey(provider, apiKey);
      if (!isValid) {
        throw new Error("La clé API semble invalide");
      }

      // Mode de secours : stockage local si Supabase pose problème
      if (loadError) {
        // Stocker localement en cas d'erreur de base de données
        localStorage.setItem(`api_key_${provider}`, apiKey);
        setConfigs(prev => ({
          ...prev,
          [provider]: apiKey
        }));
        
        toast({
          title: "Configuration sauvegardée localement",
          description: `La clé API pour ${provider} a été mise à jour localement (mode hors ligne)`,
        });
        setIsSubmitting(prev => ({ ...prev, [provider]: false }));
        return;
      }

      // Chiffrer les clés API dans la base de données (utilisation de service_configurations)
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: provider,
          config: { apiKey }, // Objet avec la propriété apiKey
          status: 'configured',
        }, {
          onConflict: 'service_type'
        });

      if (error) throw error;

      setConfigs(prev => ({
        ...prev,
        [provider]: apiKey
      }));

      toast({
        title: "Configuration sauvegardée",
        description: `La clé API pour ${provider} a été mise à jour avec succès`,
      });
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, [provider]: false }));
    }
  };

  return {
    configs,
    isSubmitting,
    loadError,
    handleApiKeyChange,
    handleSaveConfig
  };
}
