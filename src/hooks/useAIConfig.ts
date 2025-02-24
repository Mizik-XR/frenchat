
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIConfig {
  id?: string;
  provider: string;
  model_name: string;
  api_endpoint: string;
  config?: Record<string, any>;
}

export function useAIConfig() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .select('*');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      console.error('Error fetching AI configs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (config: AIConfig) => {
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .upsert({
          provider: config.provider,
          model_name: config.model_name,
          api_endpoint: config.api_endpoint,
          config: config.config
        })
        .select()
        .single();

      if (error) throw error;

      setConfigs(prev => {
        const index = prev.findIndex(c => c.id === data.id);
        if (index >= 0) {
          return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
        }
        return [...prev, data];
      });

      return data;
    } catch (error: any) {
      console.error('Error saving AI config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    configs,
    isLoading,
    saveConfig,
    refreshConfigs: fetchConfigs
  };
}
