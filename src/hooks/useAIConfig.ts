
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AIConfig } from "@/types/config";

export const useAIConfig = () => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [provider, setProvider] = useState("huggingface");
  const [modelName, setModelName] = useState("mistralai/Mistral-7B-Instruct-v0.1");
  const [testText, setTestText] = useState(
    "La conférence sur le changement climatique a réuni plus de 1000 participants de 50 pays différents. Les discussions ont porté sur la réduction des émissions de CO2 et les énergies alternatives. Un accord a été signé pour limiter le réchauffement global."
  );

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .select('*');

      if (error) throw error;

      // Conversion des données en AIConfig[]
      const aiConfigs: AIConfig[] = data.map(item => ({
        provider: item.provider as any,
        model: item.model_name,
        apiKey: item.api_key,
        config: typeof item.config === 'object' ? item.config : {}
      }));

      setConfigs(aiConfigs);
    } catch (error) {
      console.error("Erreur lors du chargement des configurations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (config: Partial<AIConfig>) => {
    setIsLoading(true);
    try {
      // Récupérer l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Utilisateur non connecté");
      
      // Mise à jour de la table user_ai_configs
      const { error } = await supabase
        .from('user_ai_configs')
        .upsert({
          provider: config.provider || provider,
          model_name: config.model || modelName,
          api_endpoint: '',
          config: config.config || {},
          user_id: userData.user.id
        }, {
          onConflict: 'provider,user_id'
        });

      if (error) throw error;

      // Mettre à jour l'état local
      setConfigs(prev => {
        const existingConfigIndex = prev.findIndex(c => c.provider === config.provider);
        if (existingConfigIndex >= 0) {
          // Mise à jour d'une configuration existante
          const newConfigs = [...prev];
          newConfigs[existingConfigIndex] = {
            ...newConfigs[existingConfigIndex],
            ...config
          };
          return newConfigs;
        } else {
          // Ajout d'une nouvelle configuration
          const newConfig: AIConfig = {
            provider: config.provider || provider,
            model: config.model || modelName,
            config: config.config || {}
          };
          return [...prev, newConfig];
        }
      });

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres ont été mis à jour avec succès"
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    configs,
    isLoading,
    provider,
    setProvider,
    modelName,
    setModelName,
    testText,
    setTestText,
    summary,
    setSummary,
    loadConfigs,
    saveConfig
  };
};
