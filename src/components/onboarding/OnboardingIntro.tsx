
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OnboardingStep } from "./OnboardingStep";
import { useOnboarding } from "@/hooks/useOnboarding";
import { MessageSquare, FolderOpen, Settings, FileText, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ONBOARDING_STEPS = [
  {
    title: "Bienvenue sur FileChat!",
    description: "FileChat est votre assistant IA pour analyser, rechercher et générer des documents intelligents à partir de vos fichiers.",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    title: "Chat conversationnel intelligent",
    description: "Posez des questions sur vos documents et obtenez des réponses précises basées sur leur contenu. Notre interface de type 'WhatsApp' vous permet de répondre à des messages spécifiques et d'organiser vos conversations par dossiers.",
    icon: <MessageSquare className="h-6 w-6" />,
    image: "/lovable-uploads/7e688c58-987c-44c7-8ccb-3003407646a2.png",
  },
  {
    title: "Indexation de documents",
    description: "Connectez votre Google Drive ou Microsoft Teams pour indexer automatiquement vos documents. FileChat analysera leur contenu pour répondre à vos questions avec précision.",
    icon: <FolderOpen className="h-6 w-6" />,
  },
  {
    title: "Génération de documents",
    description: "Créez des documents structurés comme des business plans ou des demandes de subvention directement depuis vos sources. Prévisualisez-les et exportez-les vers Google Drive ou Teams.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Recherche avancée",
    description: "Utilisez notre moteur de recherche sémantique pour trouver rapidement des informations dans des centaines de documents. FileChat comprend le sens de vos questions, pas seulement les mots-clés.",
    icon: <Search className="h-6 w-6" />,
    image: "/lovable-uploads/b273a0a1-adfe-4515-b99c-34e1a3ac8c9f.png",
  },
];

export const OnboardingIntro = () => {
  const { 
    showOnboarding, 
    currentStep, 
    nextStep, 
    previousStep,
    completeOnboarding 
  } = useOnboarding();

  const handleComplete = () => {
    completeOnboarding();
    toast({
      title: "Tutoriel terminé!",
      description: "Vous pouvez le revoir à tout moment dans les paramètres.",
    });
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent 
        className="sm:max-w-xl bg-transparent border-none shadow-none p-0"
      >
        <OnboardingStep
          title={ONBOARDING_STEPS[currentStep].title}
          description={ONBOARDING_STEPS[currentStep].description}
          image={ONBOARDING_STEPS[currentStep].image}
          icon={ONBOARDING_STEPS[currentStep].icon}
          index={currentStep}
          totalSteps={ONBOARDING_STEPS.length}
          onPrevious={previousStep}
          onNext={nextStep}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
