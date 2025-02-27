
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur a déjà vu l'onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setLoading(true);
      
      // Vérifier d'abord dans le localStorage pour une expérience rapide
      const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding") === "true";
      
      if (hasSeenOnboarding) {
        setShowOnboarding(false);
        setLoading(false);
        return;
      }
      
      // Si pas dans localStorage, vérifier dans Supabase
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          // Si le profil existe et a un flag is_first_login à false
          // Nous utilisons is_first_login comme proxy puisque has_seen_onboarding n'existe pas
          if (profile && profile.is_first_login === false) {
            setShowOnboarding(false);
            localStorage.setItem("has_seen_onboarding", "true");
          } else {
            // Sinon, montrer l'onboarding
            setShowOnboarding(true);
          }
        } else {
          // Si pas connecté, montrer l'onboarding (stockage localStorage uniquement)
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'onboarding:", error);
        // Par défaut, montrer l'onboarding
        setShowOnboarding(true);
      }
      
      setLoading(false);
    };
    
    checkOnboardingStatus();
  }, []);

  // Fonction pour avancer à l'étape suivante
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Fonction pour revenir à l'étape précédente
  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Fonction pour compléter l'onboarding
  const completeOnboarding = async () => {
    setShowOnboarding(false);
    localStorage.setItem("has_seen_onboarding", "true");
    
    // Mettre à jour dans Supabase si connecté
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await supabase
          .from("profiles")
          .update({ is_first_login: false })
          .eq("id", session.user.id);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut d'onboarding:", error);
    }
  };

  // Fonction pour réinitialiser l'onboarding (pour le revoir)
  const resetOnboarding = () => {
    localStorage.removeItem("has_seen_onboarding");
    setShowOnboarding(true);
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
