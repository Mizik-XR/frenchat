
import React from '@/core/reactInstance';
import { Card } from "@/components/ui/card";
import { Cloud, MessageSquare, Upload, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ImportMethod = "drive" | "teams" | "upload";

interface ImportMethodSelectorProps {
  onMethodChange: (method: ImportMethod) => void;
  selectedMethod: ImportMethod;
  onNavigate?: (path: string) => void;
}

export const ImportMethodSelector = ({
  onMethodChange,
  selectedMethod,
  onNavigate
}: ImportMethodSelectorProps) => {
  const navigate = useNavigate();
  const { isConnected: isDriveConnected, isChecking: isCheckingDrive, reconnectGoogleDrive } = useGoogleDriveStatus();

  const handleMethodSelection = (method: ImportMethod) => {
    onMethodChange(method);
  };

  const handleNext = () => {
    if (onNavigate) {
      // Utiliser la fonction de navigation personnalisée si fournie
      if (selectedMethod === "drive") {
        onNavigate("/config/google-drive");
      } else if (selectedMethod === "teams") {
        onNavigate("/config/microsoft-teams");
      } else if (selectedMethod === "upload") {
        onNavigate("/documents");
      }
    } else {
      // Navigation standard en utilisant useNavigate
      if (selectedMethod === "drive") {
        navigate("/config/google-drive");
      } else if (selectedMethod === "teams") {
        navigate("/config/microsoft-teams");
      } else if (selectedMethod === "upload") {
        navigate("/documents");
      }
    }
  };

  const handleConnectDrive = async () => {
    try {
      toast({
        title: "Connexion à Google Drive",
        description: "Redirection vers l'authentification Google...",
      });
      await reconnectGoogleDrive();
    } catch (error) {
      console.error("Erreur lors de la connexion à Google Drive:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Google Drive. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleConnectTeams = () => {
    if (onNavigate) {
      onNavigate("/config/microsoft-teams");
    } else {
      navigate("/config/microsoft-teams");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choisissez votre méthode d'import</h3>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => handleMethodSelection(value as ImportMethod)}
        className="grid gap-4"
      >
        <div>
          <Card 
            className={`relative p-4 cursor-pointer hover:border-primary transition-colors ${selectedMethod === 'drive' ? 'border-primary' : ''}`}
            onClick={() => handleMethodSelection('drive')}
          >
            <RadioGroupItem value="drive" id="drive" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <Cloud className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <Label htmlFor="drive" className="text-base font-medium">
                  Synchronisation Google Drive
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Mettez à jour automatiquement vos documents et indexez en continu.
                  Idéal pour garder votre base de connaissances toujours à jour.
                </p>
                {isDriveConnected && (
                  <span className="text-xs inline-flex items-center mt-2 px-2 py-1 rounded-full bg-green-100 text-green-800">
                    <span className="h-2 w-2 mr-1 rounded-full bg-green-500"></span>
                    Connecté
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card 
            className={`relative p-4 cursor-pointer hover:border-primary transition-colors ${selectedMethod === 'teams' ? 'border-primary' : ''}`}
            onClick={() => handleMethodSelection('teams')}
          >
            <RadioGroupItem value="teams" id="teams" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <Label htmlFor="teams" className="text-base font-medium">
                  Microsoft Teams
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Connectez-vous à Microsoft Teams pour indexer vos conversations et documents partagés.
                  Idéal pour les équipes utilisant l'écosystème Microsoft.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card 
            className={`relative p-4 cursor-pointer hover:border-primary transition-colors ${selectedMethod === 'upload' ? 'border-primary' : ''}`}
            onClick={() => handleMethodSelection('upload')}
          >
            <RadioGroupItem value="upload" id="upload" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <Upload className="h-6 w-6 text-primary" />
              <div>
                <Label htmlFor="upload" className="text-base font-medium">
                  Upload de fichiers
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Téléversez directement vos documents depuis votre appareil.
                  Simple et rapide pour des fichiers individuels.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </RadioGroup>

      <div className="flex justify-between mt-6">
        {selectedMethod === 'drive' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleConnectDrive} 
                  className="gap-2"
                  disabled={isCheckingDrive}
                >
                  {isCheckingDrive ? 'Vérification...' : isDriveConnected ? (
                    <>
                      <span>Configurer Google Drive</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      <span>Connecter Google Drive</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDriveConnected 
                  ? "Accéder à la configuration de votre Google Drive" 
                  : "Connectez votre compte Google Drive pour importer vos documents"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {selectedMethod === 'teams' && (
          <Button onClick={handleConnectTeams} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Configurer Microsoft Teams
          </Button>
        )}
        
        {selectedMethod === 'upload' && (
          <Button onClick={handleNext} className="gap-2">
            <Upload className="h-4 w-4" />
            Accéder à l'upload de fichiers
          </Button>
        )}
        
        <Button onClick={handleNext} className="ml-auto">
          Suivant
        </Button>
      </div>
    </div>
  );
};
