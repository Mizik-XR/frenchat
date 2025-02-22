
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/steps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { GoogleDriveWizard } from "./GoogleDriveWizard";
import { MicrosoftTeamsConfig } from "./MicrosoftTeamsConfig";
import { LLMConfigComponent } from "./LLMConfig";
import { ImageConfig } from "./ImageConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Définition des étapes du wizard
const steps = [
  {
    title: "Bienvenue",
    description: "Configuration initiale de l'application"
  },
  {
    title: "Google Drive",
    description: "Connexion à vos documents Google"
  },
  {
    title: "Microsoft Teams",
    description: "Intégration avec Teams"
  },
  {
    title: "LLM",
    description: "Configuration du modèle de langage"
  },
  {
    title: "Image",
    description: "Paramètres de génération d'images"
  },
  {
    title: "Récapitulatif",
    description: "Vérification finale"
  }
];

export const ConfigWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [configStatus, setConfigStatus] = useState({
    googleDrive: false,
    teams: false,
    llm: false,
    image: false
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Si on est à la dernière étape, on termine la configuration
      navigate("/chat");
      toast({
        title: "Configuration terminée",
        description: "Vous pouvez maintenant utiliser l'application.",
      });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleGoogleDriveComplete = (config: any) => {
    setConfigStatus(prev => ({ ...prev, googleDrive: true }));
    handleNext();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="p-6 animate-fade-in">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-semibold">Bienvenue dans la configuration !</h2>
              <p className="text-muted-foreground">
                Nous allons vous guider pas à pas dans la configuration de vos services.
                Vous pourrez ignorer certaines étapes et y revenir plus tard.
              </p>
              <Button onClick={handleNext} className="w-full">
                Commencer la configuration
              </Button>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <div className="animate-fade-in">
            <GoogleDriveWizard
              onConfigSave={handleGoogleDriveComplete}
              onSkip={handleSkip}
            />
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
            <MicrosoftTeamsConfig
              config={{ clientId: "", tenantId: "" }}
              onConfigChange={() => {}}
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, teams: true }));
                handleNext();
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
            <LLMConfigComponent
              config={{
                provider: "openai",
                model: "",
                apiKey: "",
                rateLimit: 10,
                batchSize: 10,
                cacheEnabled: true,
                useLocal: false
              }}
              onConfigChange={() => {}}
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, llm: true }));
                handleNext();
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
            <ImageConfig
              model="sd-v1.5"
              onModelChange={() => {
                setConfigStatus(prev => ({ ...prev, image: true }));
                handleNext();
              }}
            />
          </div>
        );

      case 5:
        return (
          <Card className="p-6 animate-fade-in">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold">Récapitulatif</h2>
              <div className="space-y-4">
                <Alert variant={configStatus.googleDrive ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Google Drive</AlertTitle>
                  <AlertDescription>
                    {configStatus.googleDrive ? "Configuré" : "Non configuré"}
                  </AlertDescription>
                </Alert>

                <Alert variant={configStatus.teams ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Microsoft Teams</AlertTitle>
                  <AlertDescription>
                    {configStatus.teams ? "Configuré" : "Non configuré"}
                  </AlertDescription>
                </Alert>

                <Alert variant={configStatus.llm ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>LLM</AlertTitle>
                  <AlertDescription>
                    {configStatus.llm ? "Configuré" : "Non configuré"}
                  </AlertDescription>
                </Alert>

                <Alert variant={configStatus.image ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Génération d'images</AlertTitle>
                  <AlertDescription>
                    {configStatus.image ? "Configuré" : "Non configuré"}
                  </AlertDescription>
                </Alert>
              </div>

              <Button onClick={handleNext} className="w-full">
                Terminer la configuration
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <Steps
          steps={steps.map(s => s.title)}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {renderCurrentStep()}

      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
          >
            Précédent
          </Button>
          <Button variant="ghost" onClick={handleSkip}>
            Ignorer cette étape
          </Button>
        </div>
      )}
    </div>
  );
};
