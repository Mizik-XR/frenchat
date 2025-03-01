
import { Button } from "@/components/ui/button";
import { LLMProviderType } from "@/types/config";

interface ProviderSelectorProps {
  localProvider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
}

export function ProviderSelector({ localProvider, onProviderChange }: ProviderSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Fournisseur local
      </label>
      <div className="flex gap-2 pb-2">
        <Button
          variant={localProvider === "huggingface" ? "default" : "outline"}
          onClick={() => onProviderChange("huggingface")}
          className="flex-1"
        >
          Hugging Face (intégré)
        </Button>
        <Button
          variant={localProvider === "ollama" ? "default" : "outline"}
          onClick={() => onProviderChange("ollama")}
          className="flex-1"
        >
          Ollama (Windows/Mac/Linux)
        </Button>
      </div>
    </div>
  );
}
