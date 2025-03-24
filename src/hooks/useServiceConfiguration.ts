
import { useState, useEffect  } from '@/core/reactInstance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ServiceType } from '@/types/config';

type ServiceStatus = 'not_configured' | 'configured' | 'error';

export function useServiceConfiguration(serviceType: ServiceType) {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<ServiceStatus>('not_configured');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction utilitaire pour déterminer le statut basé sur la configuration
  const determineStatus = (config: any): ServiceStatus => {
    if (!config || Object.keys(config).length === 0) return 'not_configured';
    return 'configured';
  };

  // Fonction pour vérifier si une configuration existe dans le localStorage
  const getLocalConfig = (serviceType: string) => {
    try {
      // Vérifier d'abord s'il y a une configuration dans localStorage
      const localApiKey = localStorage.getItem(`api_key_${serviceType}`);
      if (localApiKey) {
        return { apiKey: localApiKey };
      }
    } catch (err) {
      console.warn('Erreur lors de la lecture du localStorage:', err);
    }
    return null;
  };

  useEffect(() => {
    fetchConfig();
  }, [serviceType]);

  const fetchConfig = async () => {
    try {
      setError(null);
      
      // Tentative de récupération depuis Supabase
      const { data, error } = await supabase
        .from('service_configurations')
        .select('*')
        .eq('service_type', serviceType)
        .maybeSingle();

      if (error) {
        console.error('Error fetching config:', error);
        setError(new Error(error.message));
        
        // En cas d'erreur, essayer de récupérer depuis le localStorage
        const localConfig = getLocalConfig(serviceType);
        if (localConfig) {
          setConfig(localConfig);
          setStatus(determineStatus(localConfig));
          return;
        }
        
        setStatus('error');
        throw error;
      }

      if (data) {
        setConfig(data.config);
        setStatus(determineStatus(data.config));
      } else {
        // Si aucune donnée n'est trouvée dans Supabase, essayer le localStorage
        const localConfig = getLocalConfig(serviceType);
        if (localConfig) {
          setConfig(localConfig);
          setStatus(determineStatus(localConfig));
        } else {
          setStatus('not_configured');
        }
      }
    } catch (error: any) {
      console.error('Error fetching config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: any) => {
    try {
      setError(null);
      
      // Tentative de mise à jour dans Supabase
      try {
        const { data, error } = await supabase
          .from('service_configurations')
          .upsert({
            service_type: serviceType,
            config: newConfig,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        setConfig(data.config);
        setStatus(determineStatus(data.config));
      } catch (supabaseError: any) {
        // En cas d'erreur avec Supabase, utiliser le localStorage
        console.warn('Erreur Supabase, utilisation du localStorage:', supabaseError);
        localStorage.setItem(`api_key_${serviceType}`, newConfig.apiKey || '');
        
        setConfig(newConfig);
        setStatus(determineStatus(newConfig));
        
        // Informer l'utilisateur que la configuration a été sauvegardée localement
        toast({
          title: "Configuration sauvegardée localement",
          description: "Les paramètres ont été sauvegardés dans votre navigateur.",
        });
        
        return { config: newConfig };
      }

      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres ont été sauvegardés avec succès.",
      });

      return { config: newConfig };
    } catch (error: any) {
      console.error('Error updating config:', error);
      setError(error);
      setStatus('error');
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    config,
    status,
    isLoading,
    error,
    updateConfig,
    refreshConfig: fetchConfig
  };
}
