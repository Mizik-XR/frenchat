
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { AIProvider } from "@/types/chat";
import { toast } from "@/hooks/use-toast";
import { LLM_PROVIDERS } from "@/components/config/llm/constants";

interface AIProviderSelectProps {
  aiProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export const AIProviderSelect = ({ aiProvider, onProviderChange }: AIProviderSelectProps) => {
  const handleAIProviderChange = (value: AIProvider) => {
    onProviderChange(value);
    const provider = LLM_PROVIDERS.find(p => p.id === value);
    
    if (provider?.requiresApiKey) {
      toast({
        title: `Configuration ${provider.name}`,
        description: "Assurez-vous d'avoir configuré votre clé API dans les paramètres.",
      });
    } else {
      toast({
        title: `Mode ${provider.name}`,
        description: provider.isLocal 
          ? "Le traitement sera effectué localement dans votre navigateur."
          : "Le modèle est en cours d'initialisation...",
      });
    }
  };

  const handleConfigureAI = () => {
    const provider = LLM_PROVIDERS.find(p => p.id === aiProvider);
    
    if (provider?.requiresApiKey) {
      toast({
        title: `Configuration ${provider.name}`,
        description: provider.setupInstructions || "Pour utiliser ce modèle, vous devez configurer votre clé API dans les paramètres.",
      });
    } else {
      toast({
        title: `Configuration ${provider.name}`,
        description: provider.isLocal 
          ? "Ce modèle fonctionne localement et ne nécessite pas de configuration."
          : "Le modèle est gratuit et prêt à être utilisé !",
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <Select
        value={aiProvider}
        onValueChange={handleAIProviderChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Choisir le modèle IA" />
        </SelectTrigger>
        <SelectContent>
          {LLM_PROVIDERS.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name} {provider.requiresApiKey ? "(API Key requise)" : provider.isLocal ? "(Local)" : "(Gratuit)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={handleConfigureAI}>
        <Settings className="h-4 w-4 mr-2" />
        Configurer l'IA
      </Button>
    </div>
  );
};
