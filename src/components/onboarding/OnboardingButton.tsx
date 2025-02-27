
import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";

export const OnboardingButton = () => {
  const { resetOnboarding } = useOnboarding();

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({
      title: "Tutoriel réinitialisé",
      description: "Le guide de démarrage va s'afficher à nouveau.",
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleResetOnboarding}
      className="flex items-center gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Guide de démarrage
    </Button>
  );
};
