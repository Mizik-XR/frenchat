
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { Steps } from "@/components/ui/steps";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GoogleDriveSetup } from "./GoogleDriveSetup";

interface WizardStep {
  title: string;
  description: string;
}

interface GoogleOAuthConfig {
  client_id: string;
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
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const fetchClientId = async () => {
    try {
      console.log('Récupération de la configuration Google OAuth...');
      const { data, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération du client ID:", error);
        toast({
          title: "Erreur de configuration",
          description: "Impossible de récupérer la configuration Google Drive",
          variant: "destructive",
        });
        return;
      }

      if (data?.config && 
          typeof data.config === 'object' && 
          'client_id' in data.config && 
          typeof data.config.client_id === 'string') {
        console.log('Client ID trouvé:', data.config.client_id);
        setClientId(data.config.client_id);
      } else {
        console.log('Aucun client ID trouvé dans la configuration');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de la configuration:', err);
    }
  };

  useEffect(() => {
    fetchClientId();

    const checkGoogleDriveConnection = async () => {
      if (!user) return;

      try {
        console.log('Vérification de la connexion Google Drive...');
        const { data, error } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        setIsConnected(!!data && !error);
        console.log('État de la connexion:', !!data && !error);
        
        if (!!data && !error) {
          onConfigSave();
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la connexion:", err);
      }
    };

    checkGoogleDriveConnection();
  }, [user, onConfigSave]);

  const initiateGoogleAuth = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité",
        variant: "destructive",
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Erreur",
        description: "La configuration Google Drive n'est pas complète",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
    const redirectUri = encodeURIComponent(REDIRECT_URI);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
    
    console.log('Redirection vers Google OAuth:', authUrl);
    window.location.href = authUrl;
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchClientId(); // Recharger la configuration
  };

  return (
    <div className="space-y-6">
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Google Drive</AlertTitle>
        <AlertDescription>
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Votre compte Google Drive est connecté
            </div>
          ) : (
            "Connectez votre Google Drive en un clic ! Plus besoin de saisir des clés API, autorisez simplement l'accès à vos documents."
          )}
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
          {showSetup ? (
            <GoogleDriveSetup onConfigured={handleSetupComplete} />
          ) : (
            <>
              {isConnected ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Connexion établie</AlertTitle>
                  <AlertDescription>
                    Votre compte Google Drive est correctement configuré et prêt à être utilisé.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  onClick={initiateGoogleAuth}
                  className="w-full"
                  disabled={isConnecting || !clientId}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connexion en cours...' : 'Se connecter avec Google Drive'}
                </Button>
              )}

              {!clientId && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration manquante</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>La configuration Google Drive n'est pas complète.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSetup(true)}
                    >
                      Configurer maintenant
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground bg-secondary/20 p-4 rounded-md">
                En cliquant sur le bouton ci-dessus, vous serez redirigé vers Google pour autoriser l'accès à vos documents.
                Vous pourrez choisir quels dossiers partager avec l'application.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip}>
          Configurer plus tard
        </Button>
        {showSetup && (
          <Button variant="outline" onClick={() => setShowSetup(false)}>
            Retour
          </Button>
        )}
      </div>
    </div>
  );
};
