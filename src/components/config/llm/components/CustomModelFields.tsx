
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { AIModel } from "../types";

interface CustomModelFieldsProps {
  model: AIModel;
  onModelUpdate: (model: AIModel) => void;
}

export function CustomModelFields({ model, onModelUpdate }: CustomModelFieldsProps) {
  if (!model.isCustom) return null;

  return (
    <Card className="p-4 bg-gray-50 border-gray-200 space-y-4 animate-in fade-in-50 duration-200">
      <div className="space-y-2">
        <Label className="text-gray-700 flex items-center gap-2">
          ID du modèle Hugging Face
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Entrez l'ID complet du modèle tel qu'il apparaît sur Hugging Face</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input 
          placeholder="Ex: facebook/opt-350m"
          className="w-full font-mono text-base bg-white"
          onChange={(e) => {
            onModelUpdate({
              ...model,
              modelId: e.target.value
            });
          }}
        />
      </div>
    </Card>
  );
}
