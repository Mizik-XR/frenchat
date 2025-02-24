
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const API_MODELS = [
  {
    id: "bigscience/bloom",
    name: "BLOOM",
    description: "Modèle multilingue pour la génération de texte",
    apiOnly: true
  },
  {
    id: "facebook/opt-350m",
    name: "OPT 350M",
    description: "Modèle compact et rapide",
    apiOnly: true
  }
];

export function LocalAIConfig() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    try {
      // Test de l'API avec la clé fournie
      const response = await fetch("https://api-inference.huggingface.co/models/" + selectedModel, {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: "POST",
        body: JSON.stringify({ inputs: "Test" }),
      });

      if (!response.ok) {
        throw new Error("Erreur de configuration de l'API");
      }

      // Sauvegarde de la configuration
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'huggingface',
          config: { 
            apiKey,
            model: selectedModel,
            useApi: true
          },
          status: 'configured'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "L'API Hugging Face a été configurée avec succès",
      });
    } catch (error: any) {
      console.error('Erreur de configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de configurer l'API Hugging Face. Vérifiez votre clé API.",
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
          Configurez votre accès à l'API Hugging Face pour utiliser les modèles d'IA.
          Vous aurez besoin d'une clé API disponible sur votre compte Hugging Face.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Configuration de l'API</h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Clé API Hugging Face</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_..."
            />
            <p className="text-sm text-gray-500">
              Obtenir une clé API sur huggingface.co/settings/tokens
            </p>
          </div>

          <div className="space-y-4">
            <Label>Modèle</Label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger>
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
            disabled={!selectedModel || !apiKey || isConfiguring}
            className="w-full"
          >
            {isConfiguring ? "Configuration..." : "Sauvegarder la configuration"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
