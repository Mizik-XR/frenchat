
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Shell } from "@/components/Shell";
import { trackPageView } from "@/lib/analytics";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { initializeOllama } from "@/utils/ollamaSetup";

export default function App() {
  const { pathname } = useLocation();
  useSessionCheck();

  // Effet pour suivre les vues de page
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  
  // Initialisation automatique d'Ollama au démarrage si disponible
  useEffect(() => {
    // Vérification en arrière-plan pour ne pas bloquer le chargement de l'application
    const checkAndInitOllama = async () => {
      try {
        await initializeOllama();
      } catch (error) {
        console.error("Erreur lors de l'initialisation d'Ollama:", error);
      }
    };
    
    // Attendre un peu avant de vérifier pour laisser l'application se charger
    const timer = setTimeout(checkAndInitOllama, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AuthGuard>
        <Shell>
          <Outlet />
        </Shell>
      </AuthGuard>
      <Toaster />
    </>
  );
}
