
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OnboardingStep } from "./OnboardingStep";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Database, FileSearch, Workflow } from "lucide-react";

export const OnboardingIntro = () => {
  const { 
    showOnboarding, 
    currentStep, 
    loading,
    nextStep,
    previousStep,
    completeOnboarding,
    resetOnboarding
  } = useOnboarding();
  
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return null;

  if (!showOnboarding) return null;

  const steps = [
    {
      title: "Bienvenue dans FileChat",
      description: "FileChat vous permet d'interroger vos documents, fichiers et données avec l'IA pour obtenir des réponses précises et contextuelles.",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    {
      title: "Connectez vos sources de données",
      description: "Importez ou connectez vos documents depuis Google Drive, Microsoft Teams, ou par téléchargement direct pour les rendre accessibles à l'IA.",
      icon: <Database className="h-6 w-6" />,
    },
    {
      title: "Chat intelligent avec vos documents",
      description: "L'IA analyse vos documents et vous répond en utilisant leur contenu. Idéal pour trouver rapidement des informations précises.",
      icon: <FileSearch className="h-6 w-6" />,
    },
    {
      title: "Génération de documents structurés",
      description: "Créez des rapports, synthèses et autres documents structurés à partir de votre base documentaire. Exportez-les facilement vers Google Drive ou Teams.",
      icon: <Workflow className="h-6 w-6" />,
    },
  ];

  const handleComplete = () => {
    completeOnboarding();
    navigate("/config");
  };

  // Ajoutez les images génériques pour chaque étape
  const genericImages = [
    "/placeholder.svg", // Image générique pour l'étape 1
    "/placeholder.svg", // Image générique pour l'étape 2
    "/placeholder.svg", // Image générique pour l'étape 3
    "/placeholder.svg", // Image générique pour l'étape 4
  ];

  return (
    <Dialog open={showOnboarding} onOpenChange={resetOnboarding}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
        <OnboardingStep
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          image={genericImages[currentStep]}
          index={currentStep}
          totalSteps={steps.length}
          onPrevious={previousStep}
          onNext={nextStep}
          onComplete={handleComplete}
          icon={steps[currentStep].icon}
        />
      </DialogContent>
    </Dialog>
  );
};
