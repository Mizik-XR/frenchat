import { useState } from "react";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ImportMethodSelector, ImportMethod } from "./ImportMethod/ImportMethodSelector";
import { FileUploader } from "./ImportMethod/FileUploader";
import { GoogleDriveConfig } from "./GoogleDrive/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "./MicrosoftTeamsConfig";
import { LLMConfig } from "./llm/LLMConfig";
import { ImageConfig } from "./ImageConfig";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { title: "Bienvenue", description: "Configuration initiale de l'application" },
  { title: "Méthode d'Import", description: "Choisissez comment importer vos documents" },
  { title: "Google Drive", description: "Configuration de la synchronisation" },
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
  const [importMethod, setImportMethod] = useState<ImportMethod>("drive");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-uploaded-files', {
        body: { files }
      });

      if (error) throw error;

      toast({
        title: "Traitement terminé",
        description: `${files.length} fichiers ont été traités avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement des fichiers.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLLMSave = () => {
    setConfigStatus(prev => ({ ...prev, llm: true }));
    handleNext();
    toast({
      title: "LLM configuré",
      description: "Le modèle de langage a été configuré avec succès.",
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <div className="animate-fade-in space-y-8">
            <ImportMethodSelector
              selectedMethod={importMethod}
              onMethodChange={setImportMethod}
            />
            {importMethod === "upload" && (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                loading={isProcessing}
              />
            )}
          </div>
        );
      case 2:
        if (importMethod === "drive") {
          return (
            <div className="animate-fade-in">
              <GoogleDriveConfig />
            </div>
          );
        }
        setCurrentStep(prev => prev + 1);
        return null;
      case 3:
        return (
          <div className="animate-fade-in">
            <MicrosoftTeamsConfig
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, teams: true }));
                handleNext();
              }}
            />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <LLMConfig onSave={handleLLMSave} />
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in">
            <ImageConfig
              onSave={() => {
                setConfigStatus(prev => ({ ...prev, image: true }));
                handleNext();
              }}
            />
          </div>
        );
      case 6:
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
