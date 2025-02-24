
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BrainCircuit } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-bold">Configuration de l'IA</h2>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Sélectionnez le modèle Hugging Face à utiliser. La clé API est déjà configurée.
        </AlertDescription>
      </Alert>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Configuration du modèle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Sélectionner un modèle
            </label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-full bg-white">
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
          </div>

          <Button
            onClick={handleSaveConfig}
            disabled={!selectedModel || isConfiguring}
            className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            {isConfiguring ? "Configuration..." : "Sauvegarder la configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
