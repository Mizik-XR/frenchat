
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

export const CloudAIConfig = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = React.useState<ServiceType>("openai");
  const [apiKey, setApiKey] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");

  const models = provider === "openai" 
    ? ["gpt-4-turbo", "gpt-3.5-turbo"] 
    : ["deepseek-coder", "deepseek-chat"];

  const handleSave = async () => {
    try {
      // TODO: Implémenter la sauvegarde de la configuration
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration du modèle cloud a été mise à jour",
      });
      navigate("/config");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

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

          <Button onClick={handleSave} className="w-full">
            Sauvegarder la configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
