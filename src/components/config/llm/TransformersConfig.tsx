
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { useAIConfig } from "@/hooks/useAIConfig";
import { Download } from "lucide-react";

const TRANSFORMER_MODELS = [
  {
    id: "mistral-7b",
    name: "Mistral 7B",
    description: "Modèle polyvalent 7B paramètres"
  },
  {
    id: "llama-2-7b",
    name: "Llama 2 7B",
    description: "Modèle Meta de base 7B paramètres"
  },
  {
    id: "phi-2",
    name: "Phi-2",
    description: "Petit modèle Microsoft très performant"
  },
  {
    id: "falcon-7b",
    name: "Falcon 7B",
    description: "Modèle TII généraliste"
  }
];

const HF_MODELS = [
  {
    id: "facebook/bart-large-cnn",
    name: "BART Large CNN",
    description: "Spécialisé en résumé de texte"
  },
  {
    id: "t5-base",
    name: "T5 Base",
    description: "Modèle polyvalent pour diverses tâches"
  },
  {
    id: "google/flan-t5-base",
    name: "Flan-T5",
    description: "Version améliorée de T5 avec instructions"
  }
];

interface TransformersConfigProps {
  onConfigSave?: (config: any) => void;
}

export function TransformersConfig({ onConfigSave }: TransformersConfigProps) {
  const [selectedModel, setSelectedModel] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000");
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState<"local" | "huggingface">("local");
  
  const { textGeneration } = useHuggingFace('transformers');
  const { saveConfig } = useAIConfig();

  const handleDownloadScript = () => {
    const link = document.createElement('a');
    link.href = '/start-app.bat';
    link.download = 'start-app.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Script téléchargé",
      description: "Exécutez start-app.bat pour installer et démarrer le serveur local",
    });
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await textGeneration({
        prompt: "Test de connexion",
        model: selectedModel,
        endpoint: apiEndpoint
      });

      if (response) {
        const config = {
          provider: 'transformers',
          model_name: selectedModel,
          api_endpoint: apiEndpoint,
          config: {
            type: modelType,
            last_tested: new Date().toISOString()
          }
        };

        await saveConfig(config);

        toast({
          title: "Connexion réussie",
          description: "Le modèle est correctement configuré",
        });

        if (onConfigSave) {
          onConfigSave(config);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const models = modelType === "local" ? TRANSFORMER_MODELS : HF_MODELS;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Type de modèle</Label>
        <Select value={modelType} onValueChange={(value: "local" | "huggingface") => setModelType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Modèles locaux</SelectItem>
            <SelectItem value="huggingface">Modèles Hugging Face</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Modèle Transformer</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>URL du serveur (endpoint)</Label>
        <Input 
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          placeholder="http://localhost:8000"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          URL du serveur {modelType === "local" ? "local" : "API"} hébergeant le modèle
        </p>
      </div>

      {modelType === "local" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            <h4 className="font-medium">Installation automatique (Windows)</h4>
            <p className="text-sm text-gray-600">
              Téléchargez et exécutez le script d'installation automatique qui s'occupera de :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Installer Python si nécessaire</li>
              <li>Configurer l'environnement virtuel</li>
              <li>Installer toutes les dépendances</li>
              <li>Démarrer le serveur local</li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadScript}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le script d'installation
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button 
          onClick={handleTestConnection}
          disabled={!selectedModel || !apiEndpoint || isLoading}
          className="w-full"
        >
          {isLoading ? "Test en cours..." : "Tester la connexion"}
        </Button>
      </div>
    </div>
  );
}
