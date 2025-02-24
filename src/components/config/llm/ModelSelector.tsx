
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  value: string;
  models: string[];
  onValueChange: (value: string) => void;
  descriptions?: Record<string, string>;
}

export const ModelSelector = ({ value, models, onValueChange, descriptions = {} }: ModelSelectorProps) => {
  return (
    <div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez un modèle" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <TooltipProvider key={model}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectItem value={model} className="cursor-help">
                    {model}
                  </SelectItem>
                </TooltipTrigger>
                {descriptions[model] && (
                  <TooltipContent>
                    <p>{descriptions[model]}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
