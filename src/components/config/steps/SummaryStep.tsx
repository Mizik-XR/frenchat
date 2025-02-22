
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Settings, PlusCircle } from "lucide-react";
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

  const GoogleDriveIcon = () => (
    <svg 
      className="h-5 w-5" 
      viewBox="0 0 87.3 78" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="M43.65 25l-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 00-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="M59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );

  return (
    <Card className="p-6 animate-fade-in">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">Récapitulatif</h2>
        <div className="space-y-4">
          <Alert 
            variant={configStatus.googleDrive ? "default" : "destructive"}
            className={configStatus.googleDrive ? "border-green-200 bg-green-50" : ""}
          >
            <div className="flex items-center gap-2">
              {configStatus.googleDrive ? (
                <>
                  <GoogleDriveIcon />
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      Google Drive
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span>Connecté</span>
                      <Button variant="outline" size="sm" className="ml-2">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Ajouter un autre compte
                      </Button>
                    </AlertDescription>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <AlertTitle>Google Drive</AlertTitle>
                    <AlertDescription>Non configuré</AlertDescription>
                  </div>
                </>
              )}
            </div>
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
