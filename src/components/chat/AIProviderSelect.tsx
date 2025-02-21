
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

interface AIProviderSelectProps {
  aiProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export const AIProviderSelect = ({ aiProvider, onProviderChange }: AIProviderSelectProps) => {
  const handleAIProviderChange = (value: AIProvider) => {
    onProviderChange(value);
    if (value === 'openai') {
      toast({
        title: "Configuration OpenAI",
        description: "Assurez-vous d'avoir configuré votre clé API OpenAI dans les paramètres.",
      });
    } else {
      toast({
        title: "Mode Hugging Face",
        description: "Le traitement sera effectué localement dans votre navigateur. Le modèle est en cours de chargement...",
      });
    }
  };

  const handleConfigureAI = () => {
    if (aiProvider === 'openai') {
      toast({
        title: "Configuration OpenAI",
        description: "Pour utiliser OpenAI, vous devez configurer votre clé API. Coût : ~0.01$ par 1000 tokens.",
      });
    } else {
      toast({
        title: "Configuration Hugging Face",
        description: "Hugging Face est gratuit et fonctionne localement. Le modèle est déjà en cours de chargement !",
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
          <SelectItem value="openai">OpenAI (API Key requise)</SelectItem>
          <SelectItem value="huggingface">Hugging Face (Gratuit, Local)</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={handleConfigureAI}>
        <Settings className="h-4 w-4 mr-2" />
        Configurer l'IA
      </Button>
    </div>
  );
};
