
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, BrainCircuit, MicrosoftTeams } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleDrive } from "./GoogleDrive/useGoogleDrive";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export const QuickConfig = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected: isGoogleConnected, initiateGoogleAuth } = useGoogleDrive(user, () => {
    toast({
      title: "Google Drive connecté",
      description: "Configuration terminée avec succès",
    });
  });

  const handleGoogleConnect = async () => {
    try {
      await initiateGoogleAuth();
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Google Drive",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-bold">Configuration rapide</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <span>Google Drive</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connectez-vous à Google Drive pour synchroniser et interroger vos documents.
            </p>
            <Button 
              onClick={handleGoogleConnect}
              className="w-full"
              variant={isGoogleConnected ? "outline" : "default"}
            >
              {isGoogleConnected ? "Reconnectez Google Drive" : "Connecter Google Drive"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MicrosoftTeams className="h-5 w-5 text-purple-500" />
              <span>Microsoft Teams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accédez à vos conversations et documents Teams.
            </p>
            <Button 
              onClick={() => navigate("/config/microsoft-teams")}
              className="w-full"
            >
              Configurer Teams
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-green-500" />
            <span>Configuration de l'IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisissez et configurez votre modèle d'IA préféré pour l'analyse de documents.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                onClick={() => navigate("/config/local-ai")}
                variant="outline"
                className="w-full"
              >
                Configuration locale (Ollama)
              </Button>
              <Button 
                onClick={() => navigate("/config/cloud-ai")}
                variant="outline"
                className="w-full"
              >
                Configuration Cloud (OpenAI, etc.)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
