
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAIConfigContext } from "./AIConfigProvider";

export const useAIConfigActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const { provider, modelName, testText, setSummary } = useAIConfigContext();

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .select('*')
        .eq('provider', provider)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // Récupération de l'ID utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from('user_ai_configs')
        .upsert({
          provider,
          model_name: modelName,
          api_endpoint: '',
          config: {
            max_length: 150,
            min_length: 40,
            do_sample: false
          },
          user_id: user.id
        }, { 
          onConflict: 'provider,user_id'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Vos paramètres IA ont été mis à jour avec succès."
      });

      await loadConfig();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-summary', {
        body: { text: testText }
      });

      if (error) throw error;
      setSummary(data.summary);

      toast({
        title: "Test réussi",
        description: "Le modèle de résumé fonctionne correctement"
      });
    } catch (error) {
      console.error("Erreur lors du test:", error);
      toast({
        title: "Erreur",
        description: "Le test a échoué. Vérifiez les logs pour plus de détails.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    config,
    loadConfig,
    saveConfig,
    testSummary
  };
};
