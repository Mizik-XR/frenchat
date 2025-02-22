
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { GoogleConfig } from '@/types/config';

export const useGoogleDriveConfig = () => {
  const [config, setConfig] = useState<GoogleConfig>({ clientId: '', apiKey: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('google_drive_configs')
        .select('client_id, api_key')
        .single();

      if (error) {
        console.error('Error loading config:', error);
        return;
      }

      if (data) {
        setConfig({
          clientId: data.client_id,
          apiKey: data.api_key
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: GoogleConfig) => {
    try {
      const { error } = await supabase
        .from('google_drive_configs')
        .upsert({
          user_id: user?.id,
          client_id: newConfig.clientId,
          api_key: newConfig.apiKey
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder la configuration"
        });
        throw error;
      }

      setConfig(newConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration Google Drive a été mise à jour avec succès"
      });

    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  return {
    config,
    isLoading,
    saveConfig
  };
};
