
import { useEffect, useState } from "react";
import { AlertTriangle, Server, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLovableEnvironment, isPreviewEnvironment } from "@/utils/environment";

interface EnvironmentDetectionProps {
  children: React.ReactNode;
}

export const EnvironmentDetection: React.FC<EnvironmentDetectionProps> = ({ children }) => {
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [services, setServices] = useState({
    localAI: false,
    supabase: true,
  });
  const [isCheckingServices, setIsCheckingServices] = useState(false);
  const [checkAttempted, setCheckAttempted] = useState(false);

  // Vérification des URLs comme étant des environnements de prévisualisation
  useEffect(() => {
    // Utiliser les fonctions d'utilitaire pour détecter l'environnement
    const isPreview = isPreviewEnvironment();
    const isLovable = isLovableEnvironment();
    
    setIsPreviewEnv(isPreview);
    
    // Vérifier si mode cloud est forcé par un paramètre d'URL ou une variable d'environnement
    const urlParams = new URLSearchParams(window.location.search);
    const forceCloudMode = urlParams.get('forceCloud') === 'true' || 
                          urlParams.get('mode') === 'cloud' ||
                          window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true';
    
    if (forceCloudMode) {
      console.log("Mode cloud forcé par configuration. Aucune vérification locale ne sera effectuée.");
      window.localStorage.setItem('aiServiceType', 'cloud');
      return;
    }

    // Ne rien vérifier en environnement de prévisualisation
    if (isPreview) {
      // Si Lovable, forcer le mode cloud
      if (isLovable) {
        window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        window.localStorage.setItem('aiServiceType', 'cloud');
        console.log("Environnement Lovable détecté, mode cloud activé automatiquement.");
      }
      return;
    }
    
    // Pour localhost, vérifier mais de façon non-bloquante et très différée
    if (window.location.hostname === 'localhost') {
      console.log("Planification d'une vérification différée des services locaux...");
      const timer = setTimeout(() => {
        // Seulement vérifier si l'utilisateur est sur le chat (pas en auth ou accueil)
        if (window.location.pathname.includes('/chat') || 
            window.location.pathname.includes('/document')) {
          checkServices();
        } else {
          console.log("Vérification ignorée car l'utilisateur n'est pas en mode chat");
        }
      }, 5000); // Largement différé pour permettre le chargement complet
      
      return () => clearTimeout(timer);
    }
  }, []);

  const checkServices = async () => {
    console.log("Vérification des services locaux en cours...");
    setIsCheckingServices(true);
    
    try {
      // Utiliser un AbortController avec un timeout plus court
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      console.log("Tentative de connexion au service IA local...");
      const response = await fetch("http://localhost:8000/health", { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log("Service IA local détecté et fonctionnel");
        setServices(prev => ({ ...prev, localAI: true }));
        // Stockage de la préférence utilisateur
        if (!window.localStorage.getItem('aiServiceType')) {
          window.localStorage.setItem('aiServiceType', 'local');
        }
      } else {
        console.log("Service IA local détecté mais renvoie une erreur:", response.status);
        setServices(prev => ({ ...prev, localAI: false }));
      }
    } catch (error) {
      console.log("Service IA local non disponible:", error);
      setServices(prev => ({ ...prev, localAI: false }));
      
      // Ne pas afficher d'alerte en phase d'authentification ou sur la page d'accueil
      const isAuthPath = window.location.pathname === '/' || 
                        window.location.pathname === '/auth' ||
                        window.location.pathname === '/config';
      
      if (window.location.hostname === 'localhost' && 
          !isAuthPath && 
          window.localStorage.getItem('aiServiceType') === 'local') {
        setShowAlert(true);
      } else {
        // Passage automatique au cloud sans alerte
        if (window.localStorage.getItem('aiServiceType') === 'local') {
          console.log("Passage automatique au mode cloud (IA locale configurée mais indisponible)");
          window.localStorage.setItem('aiServiceType', 'cloud');
        }
      }
    } finally {
      setIsCheckingServices(false);
      setCheckAttempted(true);
    }
  };

  // Ne jamais bloquer le rendu de l'application
  if (isPreviewEnv || !checkAttempted || !showAlert) {
    return <>{children}</>;
  }

  // Afficher l'alerte seulement si explicitement demandé et sur localhost
  if (showAlert && window.location.hostname === 'localhost') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <Server className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Service IA local non détecté</h2>
          </div>
          
          <p className="mb-4 text-gray-600">
            Le service d'IA local de Frenchat n'est pas accessible. Cela peut être dû à:
          </p>
          
          <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
            <li>Le service n'a pas été démarré</li>
            <li>Un problème de connexion au port 8000</li>
            <li>Un pare-feu bloquant l'accès</li>
          </ul>
          
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Info className="h-5 w-5" />
              <h3 className="font-medium">Comment résoudre ce problème?</h3>
            </div>
            <p className="text-sm text-blue-700">
              Exécutez le script de démarrage complet qui lance à la fois l'interface et le service d'IA:
            </p>
            <div className="bg-gray-800 text-gray-200 p-2 rounded mt-2 text-sm font-mono">
              <p>Windows: .\start-app.bat</p>
              <p>macOS/Linux: ./start-ai-service.sh</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                setShowAlert(false); 
                window.localStorage.setItem('aiServiceType', 'cloud');
                console.log("Passage au mode cloud par choix utilisateur");
              }} 
              className="w-full"
            >
              Continuer en mode cloud
            </Button>
            
            <Button 
              variant="outline"
              onClick={checkServices}
              className="w-full flex items-center justify-center gap-2"
            >
              Vérifier à nouveau
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Rafraîchir la page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
