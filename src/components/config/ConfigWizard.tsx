
import { useState, useEffect } from "react";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ImportMethodSelector, ImportMethod } from "./ImportMethod/ImportMethodSelector";
import { LocalAIConfig } from "./llm/LocalAIConfig";
import { ImageConfig } from "./ImageConfig";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { LLMProviderType } from "@/types/config";

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
  const googleDriveStatus = useGoogleDriveStatus();
  
  const [configStatus, setConfigStatus] = useState({
    googleDrive: googleDriveStatus.isConnected,
    teams: false,
    llm: false,
    image: false
  });
  
  const [importMethod, setImportMethod] = useState<ImportMethod>("drive");
  const [modelPath, setModelPath] = useState("");
  const [provider, setProvider] = useState<LLMProviderType>("huggingface");

  // Mise à jour du statut Google Drive lorsqu'il change
  useEffect(() => {
    setConfigStatus(prev => ({
      ...prev,
      googleDrive: googleDriveStatus.isConnected
    }));
  }, [googleDriveStatus.isConnected]);

  // Sauvegarde de l'état de la configuration dans sessionStorage
  useEffect(() => {
    // Sauvegarde de l'étape actuelle
    sessionStorage.setItem('currentConfigStep', currentStep.toString());
    // Sauvegarde de la méthode d'import sélectionnée
    sessionStorage.setItem('selectedImportMethod', importMethod);
  }, [currentStep, importMethod]);

  // Récupération de l'état depuis sessionStorage lors de l'initialisation
  useEffect(() => {
    const savedStep = sessionStorage.getItem('currentConfigStep');
    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }

    const savedMethod = sessionStorage.getItem('selectedImportMethod');
    if (savedMethod) {
      setImportMethod(savedMethod as ImportMethod);
    }
  }, []);

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
    sessionStorage.setItem('selectedImportMethod', method);
  };

  const handleDirectNavigation = (path: string) => {
    // Sauvegarde de l'état actuel avant navigation
    sessionStorage.setItem('lastConfigState', JSON.stringify({
      step: currentStep,
      method: importMethod,
      status: configStatus
    }));
    
    navigate(path);
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
              onNavigate={(path) => handleDirectNavigation(path)}
            />
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
              <LocalAIConfig 
                modelPath={modelPath}
                onModelPathChange={setModelPath}
                provider={provider}
                onProviderChange={setProvider}
                onSave={handleLLMSave} 
              />
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
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sessionStorage.setItem('currentConfigStep', nextStep.toString());
    } else {
      // Nettoyage du sessionStorage lors de la finalisation
      sessionStorage.removeItem('currentConfigStep');
      sessionStorage.removeItem('selectedImportMethod');
      sessionStorage.removeItem('lastConfigState');
      
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
          onStepClick={(step) => {
            setCurrentStep(step);
            sessionStorage.setItem('currentConfigStep', step.toString());
          }}
        />
      </div>

      {renderCurrentStep()}

      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const prevStep = Math.max(currentStep - 1, 0);
              setCurrentStep(prevStep);
              sessionStorage.setItem('currentConfigStep', prevStep.toString());
            }}
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
