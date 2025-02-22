
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { Steps } from "@/components/ui/steps";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface WizardStep {
  title: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  {
    title: "Connexion à Google Drive",
    description: "Autorisez l'accès à vos documents Google Drive"
  },
  {
    title: "Vérification",
    description: "Confirmation de la connexion"
  }
];

const GOOGLE_OAUTH_CLIENT_ID = "YOUR_CLIENT_ID"; // À configurer dans la console Google Cloud
const REDIRECT_URI = `${window.location.origin}/auth/callback/google`;

export const GoogleDriveWizard = ({
  onConfigSave,
  onSkip
}: {
  onConfigSave: () => void;
  onSkip: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const initiateGoogleAuth = () => {
    if (!user) return;
    
    setIsConnecting(true);
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${user.id}`;
    
    window.location.href = authUrl;
  };

  const checkConnection = async () => {
    if (!user) return false;

    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google_drive')
      .single();

    return !error && data;
  };

  return (
    <div className="space-y-6">
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration simplifiée</AlertTitle>
        <AlertDescription>
          Connectez votre Google Drive en un clic ! Plus besoin de saisir des clés API, autorisez simplement l'accès à vos documents.
        </AlertDescription>
      </Alert>

      <Steps
        steps={wizardSteps.map(step => step.title)}
        currentStep={currentStep}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{wizardSteps[currentStep].title}</CardTitle>
          <CardDescription>{wizardSteps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={initiateGoogleAuth}
            className="w-full"
            disabled={isConnecting}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isConnecting ? 'Connexion en cours...' : 'Se connecter avec Google Drive'}
          </Button>

          <div className="text-sm text-muted-foreground bg-secondary/20 p-4 rounded-md">
            En cliquant sur le bouton ci-dessus, vous serez redirigé vers Google pour autoriser l'accès à vos documents.
            Vous pourrez choisir quels dossiers partager avec l'application.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip}>
          Configurer plus tard
        </Button>
      </div>
    </div>
  );
};
