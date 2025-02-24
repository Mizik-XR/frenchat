
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { AIModel } from "./types";

interface CustomModelFormProps {
  onModelAdd: (model: AIModel) => void;
  type: "local" | "cloud";
}

export function CustomModelForm({ onModelAdd, type }: CustomModelFormProps) {
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
      
      toast({
        title: "Modèle ajouté",
        description: "Le modèle personnalisé a été ajouté avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier ou d'ajouter le modèle",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium">Ajouter un modèle personnalisé</h3>
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Nom du modèle</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mon modèle personnalisé"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-gray-600">ID du modèle Hugging Face</label>
        <Input
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          placeholder="Ex: facebook/opt-350m"
          required
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
