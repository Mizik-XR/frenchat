
import { useState } from "react";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ImportMethodSelector, ImportMethod } from "./ImportMethod/ImportMethodSelector";
import { GoogleDriveConfig } from "./GoogleDrive/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "./MicrosoftTeamsConfig";
import { LocalAIConfig } from "./llm/LocalAIConfig";
import { ImageConfig } from "./ImageConfig";
import { supabase } from "@/integrations/supabase/client";

// Réduit à 4 étapes principales au lieu de 7
const STEPS = [
  { title: "Bienvenue", description: "Configuration initiale de l'application" },
  { title: "Sources", description: "Importation de vos documents" },
  { title: "Intelligence", description: "Configuration de l'IA" },
  { title: "Finalisation", description: "Vérification finale" }
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
  const [importMethod, setImportMethod] = useState<ImportMethod>("drive");

  const handleLLMSave = () => {
    setConfigStatus(prev => ({ ...prev, llm: true }));
    handleNext();
    toast({
      title: "IA configurée",
      description: "Le modèle de langage a été configuré avec succès.",
    });
  };

  const handleImportMethodChange = (method: ImportMethod) => {
    setImportMethod(method);
    // Nous ne faisons pas la navigation ici, car elle est maintenant
    // gérée dans le composant ImportMethodSelector
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <div className="animate-fade-in space-y-8">
            <h2 className="text-xl font-semibold mb-4">Sources de données</h2>
            <ImportMethodSelector
              selectedMethod={importMethod}
              onMethodChange={handleImportMethodChange}
            />
            {importMethod === "drive" && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium mb-2">Google Drive</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connectez votre Google Drive pour indexer et analyser vos documents.
                </p>
                <GoogleDriveConfig />
              </div>
            )}
            {importMethod === "teams" && (
              <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-medium mb-2">Microsoft Teams</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connectez Microsoft Teams pour accéder à vos conversations et documents.
                </p>
                <MicrosoftTeamsConfig
                  onSave={() => {
                    setConfigStatus(prev => ({ ...prev, teams: true }));
                    handleNext();
                  }}
                />
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-semibold mb-4">Configuration de l'intelligence artificielle</h2>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
              <h3 className="text-lg font-medium mb-2">Modèle de langage</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configurez le modèle de langage qui sera utilisé pour comprendre et répondre à vos questions.
              </p>
              <LocalAIConfig onSave={handleLLMSave} />
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-lg font-medium mb-2">Génération d'images</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configurez les paramètres de génération d'images (optionnel).
              </p>
              <ImageConfig
                onSave={() => {
                  setConfigStatus(prev => ({ ...prev, image: true }));
                  handleNext();
                }}
              />
            </div>
          </div>
        );
      case 3:
        return <SummaryStep configStatus={configStatus} onFinish={handleNext} />;
      default:
        return null;
    }
  };

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
