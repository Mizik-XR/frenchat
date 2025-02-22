
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ServiceType } from '@/types/config';

type ServiceStatus = 'not_configured' | 'configured' | 'error';

export function useServiceConfiguration(serviceType: ServiceType) {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<ServiceStatus>('not_configured');
  const [isLoading, setIsLoading] = useState(true);

  // Fonction utilitaire pour déterminer le statut basé sur la configuration
  const determineStatus = (config: any): ServiceStatus => {
    if (!config || Object.keys(config).length === 0) return 'not_configured';
    return 'configured';
  };

  useEffect(() => {
    fetchConfig();
  }, [serviceType]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('*')
        .eq('service_type', serviceType)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data.config);
        setStatus(determineStatus(data.config));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setStatus('error');
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

      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres ont été sauvegardés avec succès.",
      });

      return data;
    } catch (error) {
      console.error('Error updating config:', error);
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
    updateConfig,
    refreshConfig: fetchConfig
  };
}
