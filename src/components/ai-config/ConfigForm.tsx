
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { useAIConfigContext } from "./AIConfigProvider";

interface ConfigFormProps {
  isLoading: boolean;
  onSaveConfig: () => Promise<void>;
}

export const ConfigForm = ({ isLoading, onSaveConfig }: ConfigFormProps) => {
  const { provider, modelName, setProvider, setModelName } = useAIConfigContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fournisseur</Label>
        <Select 
          value={provider} 
          onValueChange={setProvider}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="huggingface">Hugging Face (Local)</SelectItem>
            <SelectItem value="ollama">Ollama (Local)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Modèle</Label>
        <Select 
          value={modelName} 
          onValueChange={setModelName}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="t5-small">T5 Small (Résumé)</SelectItem>
            <SelectItem value="bart-large-cnn">BART CNN (Résumé)</SelectItem>
            <SelectItem value="facebook/bart-large-xsum">BART XSum (Résumé)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onSaveConfig} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Sauvegarde en cours...
          </>
        ) : (
          'Sauvegarder la configuration'
        )}
      </Button>
    </div>
  );
};
