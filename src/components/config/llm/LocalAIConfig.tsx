
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const API_MODELS = [
  {
    id: "bigscience/bloom",
    name: "BLOOM",
    description: "Modèle multilingue pour la génération de texte",
  },
  {
    id: "facebook/opt-350m",
    name: "OPT 350M",
    description: "Modèle compact et rapide",
  }
];

export function LocalAIConfig() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const { data, error } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'huggingface')
      .single();

    if (data?.config?.model) {
      setSelectedModel(data.config.model);
    }
  };

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      // Test de connexion à l'API Hugging Face
      const response = await supabase.functions.invoke('check-model-availability', {
        body: { modelType: 'api', modelId: selectedModel }
      });

      if (!response.data) {
        throw new Error("Erreur lors de la vérification du modèle");
      }

      // Sauvegarde de la configuration
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'huggingface',
          config: { 
            model: selectedModel,
            useApi: true
          },
          status: 'configured'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration Hugging Face a été mise à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sélectionnez le modèle Hugging Face à utiliser. La clé API est déjà configurée.
        </AlertDescription>
      </Alert>

      <Card className="p-6 glass-panel">
        <h3 className="text-lg font-medium mb-4">Configuration du modèle</h3>
        
        <div className="space-y-6">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              {API_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-sm text-gray-500">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSaveConfig}
            disabled={!selectedModel || isConfiguring}
            className="w-full hover-scale"
          >
            {isConfiguring ? "Configuration..." : "Sauvegarder la configuration"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
