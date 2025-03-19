
import { useEffect, useState } from "react";
import { AlertTriangle, Server, ExternalLink, Info, Cloud, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLovableEnvironment, isPreviewEnvironment } from "@/utils/environment";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { APP_STATE } from "@/compatibility/supabaseCompat";

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
  const [offlineMode, setOfflineMode] = useState(() => {
    // Initialiser selon la valeur du localStorage ou l'état de APP_STATE
    if (typeof window !== 'undefined') {
      return localStorage.getItem('OFFLINE_MODE') === 'true' || APP_STATE.isOfflineMode;
    }
    return false;
  });
  const [enableSupabaseInLovable, setEnableSupabaseInLovable] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ENABLE_SUPABASE_IN_LOVABLE') === 'true';
    }
    return false;
  });
  const [enableLocalAIInLovable, setEnableLocalAIInLovable] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ENABLE_LOCAL_AI_IN_LOVABLE') === 'true';
    }
    return false;
  });

  // Vérification des URLs comme étant des environnements de prévisualisation
  useEffect(() => {
    // Utiliser les fonctions d'utilitaire pour détecter l'environnement
    const isPreview = isPreviewEnvironment();
    const isLovable = isLovableEnvironment();
    
    setIsPreviewEnv(isPreview);
    
    // Vérifier si mode cloud est forcé par un paramètre d'URL ou une variable d'environnement
    const urlParams = new URLSearchParams(window.location.search);
    const forceCloudMode = urlParams.get('forceCloud') === 'true' || 
                          urlParams.get('mode') === 'cloud';
    
    // Vérifier les paramètres spécifiques pour forcer le mode en ligne ou hors ligne
    const forceOnline = urlParams.get('forceOnline') === 'true';
    const forceOffline = urlParams.get('forceOffline') === 'true';
    
    if (forceOnline) {
      APP_STATE.setOfflineMode(false);
      localStorage.setItem('OFFLINE_MODE', 'false');
      setOfflineMode(false);
      toast({
        title: "Mode en ligne forcé activé",
        variant: "default"
      });
    } else if (forceOffline) {
      APP_STATE.setOfflineMode(true);
      localStorage.setItem('OFFLINE_MODE', 'true');
      setOfflineMode(true);
      toast({
        title: "Mode hors ligne forcé activé",
        variant: "default"
      });
    } else if (forceCloudMode) {
      console.log("Mode cloud forcé par configuration. Aucune vérification locale ne sera effectuée.");
      window.localStorage.setItem('aiServiceType', 'cloud');
      return;
    }

    // Dans l'environnement Lovable, afficher un toast informant du mode actuel
    if (isLovable) {
      const lovableOnlineMode = localStorage.getItem('ENABLE_SUPABASE_IN_LOVABLE') === 'true';
      if (lovableOnlineMode) {
        toast({
          title: "Mode Supabase activé dans l'environnement Lovable",
          variant: "default"
        });
      } else {
        toast({
          title: "Mode hors ligne actif dans l'environnement Lovable (par défaut)",
          variant: "default"
        });
      }
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

  // Gestion du basculement du mode hors ligne
  const handleOfflineToggle = (enabled: boolean) => {
    APP_STATE.setOfflineMode(enabled);
    localStorage.setItem('OFFLINE_MODE', enabled ? 'true' : 'false');
    setOfflineMode(enabled);
    
    // Notification à l'utilisateur
    toast({
      title: enabled ? 'Mode hors ligne activé' : 'Mode hors ligne désactivé',
      description: enabled 
        ? 'L\'application fonctionnera sans connexion à Supabase.' 
        : 'L\'application tentera de se connecter à Supabase.',
      variant: enabled ? 'destructive' : 'default'
    });
    
    // Rechargement de la page pour appliquer le changement
    if (enabled) {
      // En mode hors ligne, rediriger vers la page d'accueil si on est sur une route protégée
      if (window.location.pathname.includes('/chat') || 
          window.location.pathname.includes('/document')) {
        window.location.href = '/';
      } else {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };
  
  // Gestion du basculement de Supabase dans Lovable
  const handleSupabaseInLovableToggle = (enabled: boolean) => {
    localStorage.setItem('ENABLE_SUPABASE_IN_LOVABLE', enabled ? 'true' : 'false');
    setEnableSupabaseInLovable(enabled);
    
    // Notification à l'utilisateur
    toast({
      title: enabled ? 'Mode Supabase activé' : 'Mode Supabase désactivé',
      description: enabled 
        ? 'L\'application tentera de se connecter à Supabase dans l\'environnement Lovable.' 
        : 'L\'application fonctionnera en mode hors ligne dans l\'environnement Lovable.',
      variant: 'default'
    });
    
    // Rechargement de la page pour appliquer le changement
    window.location.reload();
  };
  
  // Gestion du basculement de l'IA locale dans Lovable
  const handleLocalAIInLovableToggle = (enabled: boolean) => {
    localStorage.setItem('ENABLE_LOCAL_AI_IN_LOVABLE', enabled ? 'true' : 'false');
    setEnableLocalAIInLovable(enabled);
    
    // Notification à l'utilisateur
    toast({
      title: enabled ? 'IA locale activée' : 'IA locale désactivée',
      description: enabled 
        ? 'L\'application utilisera l\'IA locale dans l\'environnement Lovable.' 
        : 'L\'application n\'utilisera pas l\'IA locale dans l\'environnement Lovable.',
      variant: 'default'
    });
  };

  // Ne jamais bloquer le rendu de l'application
  if (isPreviewEnv || !checkAttempted || !showAlert) {
    // Si nous sommes dans l'environnement Lovable, afficher les options de basculement
    if (isLovableEnvironment()) {
      return (
        <>
          <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Supabase</span>
              </div>
              <Switch
                checked={enableSupabaseInLovable}
                onCheckedChange={handleSupabaseInLovableToggle}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-green-500" />
                <span className="text-sm">IA Locale</span>
              </div>
              <Switch
                checked={enableLocalAIInLovable}
                onCheckedChange={handleLocalAIInLovableToggle}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm">Mode hors ligne</span>
              </div>
              <Switch
                checked={offlineMode}
                onCheckedChange={handleOfflineToggle}
              />
            </div>
          </div>
          {children}
        </>
      );
    }
    
    // Sinon, rendre normalement
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
