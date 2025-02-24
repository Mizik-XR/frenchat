
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServiceConfiguration } from "@/hooks/useServiceConfiguration";

export const LocalAIConfig = () => {
  const navigate = useNavigate();
  const { config, updateConfig, isLoading } = useServiceConfiguration("local");
  
  const [selectedModel, setSelectedModel] = React.useState(config?.model || "llama2");
  const [localEndpoint, setLocalEndpoint] = React.useState(config?.endpoint || "http://localhost:11434");

  const models = ["llama2", "mistral", "phi"];

  const handleSave = async () => {
    try {
      await updateConfig({
        model: selectedModel,
        endpoint: localEndpoint,
        provider: "ollama",
        isLocal: true
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
          <CardTitle>Configuration Local AI (Ollama)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Point d'accès Ollama</Label>
            <Input 
              value={localEndpoint}
              onChange={(e) => setLocalEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
            />
            <p className="text-sm text-muted-foreground">
              L'URL de votre instance Ollama locale
            </p>
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
