
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelSelector } from "./llm/ModelSelector";
import { ProviderSelector } from "./llm/ProviderSelector";
import { ServiceType } from "@/types/config";
import { useServiceConfiguration } from "@/hooks/useServiceConfiguration";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LLMConfig = () => {
  const { config, status, updateConfig } = useServiceConfiguration('huggingface');
  const [selectedProvider, setSelectedProvider] = useState<ServiceType>(config?.provider || 'huggingface');
  const [selectedModel, setSelectedModel] = useState<string>(config?.model || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        provider: selectedProvider,
        model: selectedModel,
      });
      
      toast({
        title: "Configuration sauvegardée",
        description: "Le modèle LLM a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const models = selectedProvider === 'huggingface' 
    ? ['mistral-7b', 'llama-2', 'falcon-40b']
    : selectedProvider === 'openai'
    ? ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
    : ['deepseek-coder', 'deepseek-chat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration LLM</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProviderSelector 
          value={selectedProvider} 
          onValueChange={setSelectedProvider} 
        />
        
        <ModelSelector
          value={selectedModel}
          models={models}
          onValueChange={setSelectedModel}
        />

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Une erreur est survenue lors de la configuration du service LLM.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={isSaving || !selectedModel || !selectedProvider}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </Button>

        <p className="text-sm text-muted-foreground">
          Sélectionnez le fournisseur LLM et le modèle à utiliser pour le traitement du langage naturel.
        </p>
      </CardContent>
    </Card>
  );
};
