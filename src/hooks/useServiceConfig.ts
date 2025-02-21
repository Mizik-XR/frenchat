
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

type ServiceType = 'google_drive' | 'microsoft_teams' | 'openai';

export function useServiceConfig() {
  const [isLoading, setIsLoading] = useState(false);

  const saveConfig = async (serviceType: ServiceType, config: any) => {
    setIsLoading(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'manage-service-config',
        {
          body: {
            action: 'save',
            serviceType,
            config,
          },
        }
      );

      if (functionError) throw functionError;

      toast({
        title: 'Configuration sauvegardée',
        description: `La configuration de ${serviceType} a été mise à jour avec succès.`,
      });

      return functionData;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Impossible de sauvegarder la configuration : ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getConfig = async (serviceType: ServiceType) => {
    setIsLoading(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'manage-service-config',
        {
          body: {
            action: 'get',
            serviceType,
          },
        }
      );

      if (functionError) throw functionError;
      return functionData;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Impossible de récupérer la configuration : ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveConfig,
    getConfig,
    isLoading,
  };
}
