
import { useState } from "react";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SummaryStep } from "./steps/SummaryStep";
import { GoogleDriveConfig } from "./GoogleDrive/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "./MicrosoftTeamsConfig";
import { LLMConfigComponent } from "./LLMConfig";
import { ImageConfig } from "./ImageConfig";

const STEPS = [
  { title: "Bienvenue", description: "Configuration initiale de l'application" },
  { title: "Google Drive", description: "Connexion à vos documents Google" },
  { title: "Microsoft Teams", description: "Intégration avec Teams" },
  { title: "LLM", description: "Configuration du modèle de langage" },
  { title: "Image", description: "Paramètres de génération d'images" },
  { title: "Récapitulatif", description: "Vérification finale" }
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
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate("/chat");
      toast({
        title: "Configuration terminée",
        description: "Vous pouvez maintenant utiliser l'application.",
      });
    }
  };

  const handleSkip = () => handleNext();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;

      case 1:
        return (
          <div className="animate-fade-in">
            <GoogleDriveConfig />
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
            <MicrosoftTeamsConfig
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, teams: true }));
                handleNext();
                toast({
                  title: "Microsoft Teams configuré",
                  description: "L'intégration avec Teams a été configurée avec succès.",
                });
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
            <LLMConfigComponent
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, llm: true }));
                handleNext();
                toast({
                  title: "LLM configuré",
                  description: "Le modèle de langage a été configuré avec succès.",
                });
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
            <ImageConfig
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, image: true }));
                handleNext();
                toast({
                  title: "Configuration des images",
                  description: "Les paramètres de génération d'images ont été sauvegardés.",
                });
              }}
            />
          </div>
        );

      case 5:
        return <SummaryStep configStatus={configStatus} onFinish={handleNext} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <Steps
          steps={STEPS.map(s => s.title)}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {renderCurrentStep()}

      {currentStep > 0 && currentStep < STEPS.length - 1 && (
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
