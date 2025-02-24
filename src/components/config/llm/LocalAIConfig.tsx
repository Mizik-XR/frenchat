
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LocalAIConfig = () => {
  const navigate = useNavigate();
  const { config, updateConfig, isLoading } = useServiceConfiguration("local");
  
  const [selectedModel, setSelectedModel] = React.useState(config?.model || "llama2");
  const [localEndpoint, setLocalEndpoint] = React.useState(config?.endpoint || "http://localhost:11434");
  const [isTesting, setIsTesting] = React.useState(false);

  const models = ["llama2", "mistral", "phi"];

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(localEndpoint);
      if (response.ok) {
        toast({
          title: "Connexion réussie",
          description: "L'instance Ollama est accessible",
        });
      } else {
        throw new Error("Erreur de connexion");
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à l'instance Ollama",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateConfig({
        model: selectedModel,
        endpoint: localEndpoint,
        provider: "ollama",
        isLocal: true
      });
      
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres ont été mis à jour avec succès.",
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
          <Alert>
            <AlertDescription>
              Assurez-vous qu'Ollama est installé et en cours d'exécution sur votre machine.
              Les modèles seront automatiquement téléchargés lors de la première utilisation.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Point d'accès Ollama</Label>
            <div className="flex gap-2">
              <Input 
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1"
              />
              <Button 
                onClick={testConnection}
                variant="outline"
                disabled={isTesting}
              >
                Tester
              </Button>
            </div>
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
