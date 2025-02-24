
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { ProviderSelector } from "./ProviderSelector";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ServiceType } from "@/types/config";
import { toast } from "@/hooks/use-toast";
import { useServiceConfiguration } from "@/hooks/useServiceConfiguration";

export const CloudAIConfig = () => {
  const navigate = useNavigate();
  const { config, updateConfig, isLoading } = useServiceConfiguration("llm");

  const [provider, setProvider] = React.useState<ServiceType>(config?.provider || "openai");
  const [apiKey, setApiKey] = React.useState(config?.apiKey || "");
  const [selectedModel, setSelectedModel] = React.useState(config?.model || "");

  const models = provider === "openai" 
    ? ["gpt-4-turbo", "gpt-3.5-turbo"] 
    : ["deepseek-coder", "deepseek-chat"];

  React.useEffect(() => {
    if (provider === "openai" && !selectedModel) {
      setSelectedModel("gpt-3.5-turbo");
    } else if (provider === "deepseek" && !selectedModel) {
      setSelectedModel("deepseek-chat");
    }
  }, [provider]);

  const handleSave = async () => {
    try {
      await updateConfig({
        provider,
        apiKey,
        model: selectedModel,
        isLocal: false
      });
      
      navigate("/config");
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Cloud AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProviderSelector 
            value={provider}
            onValueChange={(value) => setProvider(value as ServiceType)}
          />

          <div className="space-y-2">
            <Label>Clé API</Label>
            <Input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <ModelSelector
            value={selectedModel}
            models={models}
            onValueChange={setSelectedModel}
          />

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={isLoading}
          >
            Sauvegarder la configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
