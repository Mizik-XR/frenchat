
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoogleConfig } from '@/types/config';

export const useGoogleDriveConfig = () => {
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig>({
    clientId: '',
    apiKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        // Chargement de la configuration Google
        const { data, error } = await supabase
          .from('service_configurations')
          .select('config')
          .eq('service_type', 'google_drive')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors du chargement de la configuration Google:', error);
          return;
        }

        if (data?.config) {
          const config = data.config as any;
          setGoogleConfig({
            clientId: config.clientId || '',
            apiKey: config.apiKey || ''
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const saveConfig = async (config: { clientId: string; apiKey: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'google_drive',
          config,
          status: config.clientId && config.apiKey ? 'configured' : 'not_configured'
        });

      if (error) throw error;
      
      setGoogleConfig(config);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { googleConfig, isLoading, saveConfig };
};
