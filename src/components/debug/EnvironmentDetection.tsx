
import { useEffect, useState } from "react";
import { AlertTriangle, Server, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnvironmentDetectionProps {
  children: React.ReactNode;
}

export const EnvironmentDetection: React.FC<EnvironmentDetectionProps> = ({ children }) => {
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [services, setServices] = useState({
    localAI: false,
    supabase: true,
  });
  const [isCheckingServices, setIsCheckingServices] = useState(true);
  const [checkAttempted, setCheckAttempted] = useState(false);

  useEffect(() => {
    // Détection de l'environnement de prévisualisation (Lovable, Netlify, etc.)
    const hostname = window.location.hostname;
    const isPreview = 
      hostname.includes('lovableproject.com') || 
      hostname.includes('preview') || 
      hostname.includes('netlify') ||
      hostname.includes('localhost');

    setIsPreviewEnvironment(isPreview);

    // Dans un environnement de prévisualisation, la vérification est optionnelle
    // et ne doit pas bloquer le chargement de l'application
    if (isPreview && hostname !== 'localhost') {
      setIsCheckingServices(false);
      return;
    }

    // Pour localhost, nous vérifions de façon non-bloquante
    if (isPreview) {
      setTimeout(() => {
        checkServices();
      }, 1000); // Légèrement différé pour permettre le chargement initial
    }
  }, []);

  const checkServices = async () => {
    setIsCheckingServices(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout plus court
      
      const response = await fetch("http://localhost:8000/health", { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      setServices(prev => ({ ...prev, localAI: response.ok }));
    } catch (error) {
      console.log("Service IA local non disponible:", error);
      setServices(prev => ({ ...prev, localAI: false }));
      
      // Afficher l'alerte uniquement si nous sommes sur localhost et après connexion
      if (window.location.hostname === 'localhost' && 
          window.location.pathname !== '/' && 
          window.location.pathname !== '/auth') {
        setShowAlert(true);
      }
    } finally {
      setIsCheckingServices(false);
      setCheckAttempted(true);
    }
  };

  // Ne jamais bloquer le rendu initial de l'application
  if (!checkAttempted || isPreviewEnvironment) {
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
              onClick={() => setShowAlert(false)} 
              className="w-full"
            >
              Continuer quand même
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
