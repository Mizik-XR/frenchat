
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

interface TransformersConfigProps {
  onConfigSave?: (config: any) => void;
}

export function TransformersConfig({ onConfigSave }: TransformersConfigProps) {
  const [selectedModel, setSelectedModel] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000");
  const [isLoading, setIsLoading] = useState(false);
  
  const { textGeneration } = useHuggingFace('transformers');

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await textGeneration({
        prompt: "Test de connexion",
        model: selectedModel,
        endpoint: apiEndpoint
      });

      if (response) {
        toast({
          title: "Connexion réussie",
          description: "Le modèle est correctement configuré",
        });

        if (onConfigSave) {
          onConfigSave({
            model: selectedModel,
            endpoint: apiEndpoint,
            provider: 'transformers'
          });
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Modèle Transformer</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent>
            {TRANSFORMER_MODELS.map((model) => (
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
          URL du serveur local hébergeant le modèle (ex: serveur Transformers ou Ollama)
        </p>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={handleTestConnection}
          disabled={!selectedModel || !apiEndpoint || isLoading}
          className="w-full"
        >
          {isLoading ? "Test en cours..." : "Tester la connexion"}
        </Button>
      </div>

      <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium">Guide d'installation</h4>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Installez Python et pip sur votre machine</li>
          <li>Installez transformers : <code className="bg-gray-100 px-1">pip install transformers</code></li>
          <li>Installez torch : <code className="bg-gray-100 px-1">pip install torch</code></li>
          <li>Lancez le serveur local avec l'API du modèle choisi</li>
          <li>Configurez l'URL du serveur ci-dessus</li>
        </ol>
      </div>
    </div>
  );
}
