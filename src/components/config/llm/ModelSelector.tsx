
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
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: string;
  models: string[];
  onValueChange: (value: string) => void;
  descriptions?: Record<string, string>;
  className?: string;
}

export const ModelSelector = ({ value, models, onValueChange, descriptions = {}, className }: ModelSelectorProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Modèle</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Sélectionnez le modèle d&apos;IA à utiliser</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
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
