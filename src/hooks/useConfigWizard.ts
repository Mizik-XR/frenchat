
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { ImportMethod } from "@/components/config/ImportMethod/ImportMethodSelector";
import { LLMProviderType } from "@/types/config";
import { useNavigate } from "react-router-dom";

export type ConfigStatus = {
  googleDrive: boolean;
  teams: boolean;
  llm: boolean;
  image: boolean;
};

export type WizardStep = 0 | 1 | 2 | 3;

export function useConfigWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const navigate = useNavigate();
  const googleDriveStatus = useGoogleDriveStatus();
  
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
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
      setCurrentStep(Number(savedStep) as WizardStep);
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

  const handleSkipToChat = () => {
    navigate("/chat");
    toast({
      title: "Configuration reportée",
      description: "Vous utilisez l'IA par défaut (Mistral/Mixtral en cloud)",
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      const nextStep = currentStep + 1 as WizardStep;
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

  const handleStepClick = (step: number) => {
    setCurrentStep(step as WizardStep);
    sessionStorage.setItem('currentConfigStep', step.toString());
  };

  const handleSkip = () => handleNext();
  
  const updateLLMConfig = (path: string) => {
    setModelPath(path);
  };
  
  const updateProviderType = (newProvider: LLMProviderType) => {
    setProvider(newProvider);
  };
  
  const updateImageConfigStatus = () => {
    setConfigStatus(prev => ({ ...prev, image: true }));
    handleNext();
  };

  return {
    currentStep,
    configStatus,
    importMethod,
    modelPath,
    provider,
    handleLLMSave,
    handleImportMethodChange,
    handleDirectNavigation,
    handleSkipToChat,
    handleNext,
    handleSkip,
    handleStepClick,
    updateLLMConfig,
    updateProviderType,
    updateImageConfigStatus
  };
}
