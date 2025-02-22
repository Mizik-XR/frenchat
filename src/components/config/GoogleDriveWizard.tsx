
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GoogleConfig } from "@/types/config";
import { ExternalLink, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { Steps } from "@/components/ui/steps";

interface WizardStep {
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  apis?: string[];
  details?: string;
}

const wizardSteps: WizardStep[] = [
  {
    title: "Créer un projet Google Cloud",
    description: "Commencez par créer un nouveau projet dans la Console Google Cloud.",
    action: "Ouvrir la Console Google Cloud",
    actionUrl: "https://console.cloud.google.com/projectcreate"
  },
  {
    title: "Activer les APIs nécessaires",
    description: "Activez les APIs Google requises pour le bon fonctionnement de l'application.",
    action: "Ouvrir la bibliothèque d'APIs",
    actionUrl: "https://console.cloud.google.com/apis/library",
    apis: [
      "Google Drive API",
      "Google Picker API",
      "Google OAuth2 API"
    ],
    details: "Ces APIs sont nécessaires pour accéder aux fichiers, afficher le sélecteur de fichiers et gérer l'authentification."
  },
  {
    title: "Configurer l'écran de consentement",
    description: "Configurez l'écran OAuth qui sera présenté à vos utilisateurs.",
    action: "Configurer",
    actionUrl: "https://console.cloud.google.com/apis/credentials/consent",
    details: `Scope requis:
    - https://www.googleapis.com/auth/drive.file (accès limité aux fichiers)
    - https://www.googleapis.com/auth/drive.readonly (lecture seule)
    - https://www.googleapis.com/auth/userinfo.profile (information utilisateur)`
  },
  {
    title: "Créer les identifiants",
    description: "Créez les identifiants nécessaires pour l'authentification et l'accès aux APIs.",
    action: "Créer les identifiants",
    actionUrl: "https://console.cloud.google.com/apis/credentials",
    details: `Vous aurez besoin de :
    1. Un ID Client OAuth 2.0 pour l'authentification
    2. Une Clé API pour les requêtes à l'API
    
    Pour l'ID Client OAuth :
    - Type : Application Web
    - Origines JavaScript autorisées : Ajoutez votre URL (ex: http://localhost:5173)
    - URI de redirection : Ajoutez votre URL de callback (ex: http://localhost:5173/auth/callback)
    
    Pour la Clé API :
    - Restreignez-la aux APIs Google Drive et Picker
    - Limitez-la à votre domaine pour la sécurité`
  }
];

export const GoogleDriveWizard = ({
  onConfigSave,
  onSkip
}: {
  onConfigSave: (config: GoogleConfig) => void;
  onSkip: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [config, setConfig] = useState<GoogleConfig>({
    clientId: "",
    apiKey: ""
  });

  const handleStepAction = (url: string) => {
    window.open(url, '_blank');
    setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const handleSave = () => {
    if (config.clientId && config.apiKey) {
      onConfigSave(config);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration requise</AlertTitle>
        <AlertDescription>
          Pour permettre à l'application d'accéder à vos documents Google Drive, vous devez configurer les identifiants Google Cloud et activer plusieurs APIs. Suivez le guide ci-dessous ou cliquez sur "Configurer plus tard".
        </AlertDescription>
      </Alert>

      <Steps
        steps={wizardSteps.map(step => step.title)}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{wizardSteps[currentStep].title}</CardTitle>
          <CardDescription>{wizardSteps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wizardSteps[currentStep].apis && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <AlertTitle>APIs requises</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {wizardSteps[currentStep].apis.map((api, index) => (
                    <li key={index}>{api}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {wizardSteps[currentStep].details && (
            <div className="text-sm text-muted-foreground bg-secondary/20 p-4 rounded-md whitespace-pre-wrap">
              {wizardSteps[currentStep].details}
            </div>
          )}

          {currentStep === wizardSteps.length - 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Client OAuth 2.0</label>
                <Input
                  placeholder="xxx.apps.googleusercontent.com"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Clé API</label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSave}
                className="w-full"
                disabled={!config.clientId || !config.apiKey}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Enregistrer la configuration
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleStepAction(wizardSteps[currentStep].actionUrl!)}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {wizardSteps[currentStep].action}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setShowHelp(true)}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Besoin d'aide ?
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Configurer plus tard
        </Button>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Guide détaillé de configuration</DialogTitle>
            <DialogDescription>
              Suivez ces étapes pour configurer votre accès à Google Drive
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {wizardSteps.map((step, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">Étape {index + 1}: {step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.apis && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="font-medium mb-1">APIs nécessaires :</p>
                    <ul className="list-disc list-inside space-y-1">
                      {step.apis.map((api, apiIndex) => (
                        <li key={apiIndex}>{api}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.details && (
                  <div className="bg-secondary/20 p-3 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{step.details}</pre>
                  </div>
                )}
                {step.actionUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(step.actionUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {step.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
