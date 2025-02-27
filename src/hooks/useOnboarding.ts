
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Si aucune préférence trouvée ou onboarding_completed est false, montrer l'onboarding
        setShowOnboarding(data ? !data.onboarding_completed : true);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'onboarding:", error);
        // En cas d'erreur, on suppose que l'onboarding n'a pas été fait
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          onboarding_completed: true
        });

      if (error) throw error;
      setShowOnboarding(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du statut d'onboarding:", error);
    }
  };

  const resetOnboarding = () => {
    setShowOnboarding(false);
    setCurrentStep(0);
  };

  return {
    showOnboarding,
    currentStep,
    loading,
    nextStep,
    previousStep,
    completeOnboarding,
    resetOnboarding
  };
};
