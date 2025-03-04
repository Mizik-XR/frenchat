
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorFallback } from "@/components/ErrorFallback";
import { isBrowserCompatible, logEnvironmentInfo } from "@/utils/environmentUtils";

export function InitialLoading({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initialisation de Frenchat...");

  useEffect(() => {
    // Journaliser les informations sur l'environnement pour faciliter le débogage
    logEnvironmentInfo();
    
    const steps = [
      "Vérification de l'environnement...",
      "Chargement des ressources...",
      "Initialisation de l'interface...",
      "Préparation des données...",
      "Finalisation..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingMessage(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    // Vérifier la compatibilité du navigateur
    const { compatible, issues } = isBrowserCompatible();
    if (!compatible) {
      setError(new Error(`Navigateur incompatible. Fonctionnalités manquantes: ${issues.join(', ')}`));
      setStatus("error");
      clearInterval(interval);
      return;
    }
    
    // Simuler un processus de chargement
    const timer = setTimeout(() => {
      setStatus("ready");
      clearInterval(interval);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (status === "error") {
    return <ErrorFallback error={error || undefined} />;
  }

  if (status === "loading") {
    return <LoadingScreen message={loadingMessage} />;
  }

  return <>{children}</>;
}
