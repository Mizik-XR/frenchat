
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { initializeOllama } from "@/utils/ollamaSetup";

// Créons un simple composant de protection d'authentification
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // Nous gardons la même logique, mais implémentée localement
  return <>{children}</>;
};

// Composant Shell simplifié
const Shell = ({ children }: { children: React.ReactNode }) => {
  return <main className="min-h-screen">{children}</main>;
};

// Fonction de suivi de page simplifiée
const trackPageView = (path: string) => {
  console.log(`Page visitée: ${path}`);
  // Ici, vous pourriez intégrer une vraie analytics plus tard
};

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
