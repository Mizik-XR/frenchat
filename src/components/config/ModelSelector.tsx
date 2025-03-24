
import React from '@/core/reactInstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="model-select" className="text-sm font-medium">
        Modèle IA
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Sélectionner un modèle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="mistral-7b">Mistral 7B</SelectItem>
          <SelectItem value="llama-2-13b">Llama 2 13B</SelectItem>
          <SelectItem value="claude-instant">Claude Instant</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Sélectionnez le modèle IA à utiliser pour générer des réponses.
      </p>
    </div>
  );
};
