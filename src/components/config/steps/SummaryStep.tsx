
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";

interface SummaryStepProps {
  configStatus: {
    googleDrive: boolean;
    teams: boolean;
    llm: boolean;
    image: boolean;
  };
  onFinish: () => void;
}

export const SummaryStep = ({ configStatus: initialConfigStatus, onFinish }: SummaryStepProps) => {
  const [configStatus, setConfigStatus] = useState(initialConfigStatus);
  const isGoogleDriveConnected = useGoogleDriveStatus();

  useEffect(() => {
    setConfigStatus(prev => ({
      ...prev,
      googleDrive: isGoogleDriveConnected
    }));
  }, [isGoogleDriveConnected]);

  return (
    <Card className="p-6 animate-fade-in">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">Récapitulatif</h2>
        <div className="space-y-4">
          <Alert 
            variant={configStatus.googleDrive ? "default" : "destructive"}
            className={configStatus.googleDrive ? "border-green-200 bg-green-50" : ""}
          >
            {configStatus.googleDrive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>Google Drive</AlertTitle>
            <AlertDescription>
              {configStatus.googleDrive ? "Configuré" : "Non configuré"}
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microsoft Teams</AlertTitle>
            <AlertDescription>
              Non configuré
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>LLM</AlertTitle>
            <AlertDescription>
              Non configuré
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Génération d'images</AlertTitle>
            <AlertDescription>
              Non configuré
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4">
          <Button onClick={onFinish} className="w-full">
            Terminer la configuration
          </Button>
          
          <div className="text-center">
            <Link to="/advanced-config" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <Settings className="h-4 w-4 mr-1" />
              Accéder à la configuration avancée
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
