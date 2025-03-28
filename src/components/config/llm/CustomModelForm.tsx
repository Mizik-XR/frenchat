import { React } from "@/core/ReactInstance";

import { useState  } from '@/core/reactInstance';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { AIModel } from "./types";

interface CustomModelFormProps {
  onModelAdd: (model: AIModel) => void;
  type: "local" | "cloud";
}

export function CustomModelForm({ onModelAdd, type }: CustomModelFormProps) {
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      // Vérifier que le modèle existe sur Hugging Face
      const response = await fetch(`https://huggingface.co/api/models/${modelId}`);
      if (!response.ok) {
        throw new Error("Modèle non trouvé sur Hugging Face");
      }

      const newModel: AIModel = {
        id: `custom/${modelId}`,
        name,
        description: `Modèle personnalisé : ${modelId}`,
        isCustom: true,
        modelId,
        requiresKey: type === "cloud"
      };

      onModelAdd(newModel);
      setName("");
      setModelId("");
      setIsFormVisible(false);
      
      toast({
        title: "Modèle ajouté",
        description: "Le modèle personnalisé a été ajouté avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier ou d'ajouter le modèle. Vérifiez l'ID du modèle.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (!isFormVisible) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsFormVisible(true)}
        className="w-full"
      >
        + Ajouter un modèle personnalisé
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50 animate-in slide-in-from-top-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Ajouter un modèle personnalisé</h3>
        <Button 
          variant="ghost" 
          type="button"
          size="sm"
          onClick={() => setIsFormVisible(false)}
        >
          Annuler
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Nom du modèle
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Un nom descriptif pour identifier facilement votre modèle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mon modèle personnalisé"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600 flex items-center gap-2">
          ID du modèle Hugging Face
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>L'identifiant exact du modèle sur Hugging Face (ex: facebook/opt-350m)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <Input
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          placeholder="Ex: facebook/opt-350m"
          required
          className="w-full"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isAdding || !name || !modelId}
        className="w-full"
      >
        {isAdding ? "Ajout en cours..." : "Ajouter le modèle"}
      </Button>
    </form>
  );
}
