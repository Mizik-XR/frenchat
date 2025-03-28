
import { useNavigate } from "react-router-dom";
import { useState, useEffect  } from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Server, Rocket, CheckCircle, Shield, Zap, WifiOff } from "lucide-react";

export const OllamaPromotion = () => {
  const navigate = useNavigate();
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // Vérifier si Ollama est déjà installé et en cours d'exécution
  const checkOllamaAvailability = async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://localhost:11434/api/version', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setIsOllamaAvailable(response.ok);
    } catch (error) {
      setIsOllamaAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkOllamaAvailability();
  }, []);
  
  // Si déjà configuré, ne pas afficher la promotion
  if (localStorage.getItem('localProvider') === 'ollama' && isOllamaAvailable) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Ollama est configuré</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Votre IA locale est configurée et fonctionnelle.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/config/advanced")}
          >
            Paramètres
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-blue-100 p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <Rocket className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-lg text-blue-800 mb-1">
            Améliorez votre expérience avec l'IA locale
          </h3>
          
          <p className="text-blue-600 mb-3">
            Utilisez l'intelligence artificielle directement sur votre ordinateur pour plus de confidentialité et de rapidité
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white bg-opacity-60 p-3 rounded border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-blue-800 text-sm">Confidentialité</h4>
              </div>
              <p className="text-sm text-blue-600">Vos données restent sur votre ordinateur, idéal pour les documents sensibles</p>
            </div>
            
            <div className="bg-white bg-opacity-60 p-3 rounded border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium text-blue-800 text-sm">Rapidité</h4>
              </div>
              <p className="text-sm text-blue-600">Réponses instantanées sans latence réseau, idéal pour un usage quotidien</p>
            </div>
            
            <div className="bg-white bg-opacity-60 p-3 rounded border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <WifiOff className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-blue-800 text-sm">Hors-ligne</h4>
              </div>
              <p className="text-sm text-blue-600">Utilisez l'IA même sans connexion internet, parfait pour vos déplacements</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => navigate("/local-ai-setup")}
              className="gap-2"
            >
              <Server className="h-4 w-4" />
              Installer l'IA locale
            </Button>
            
            {isOllamaAvailable === false && (
              <Button 
                variant="outline" 
                onClick={checkOllamaAvailability}
                disabled={isChecking}
              >
                Vérifier à nouveau
              </Button>
            )}
            
            {isOllamaAvailable === true && (
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.setItem('localProvider', 'ollama');
                  localStorage.setItem('localAIUrl', 'http://localhost:11434');
                  localStorage.setItem('aiServiceType', 'local');
                  window.location.reload();
                }}
              >
                Utiliser l'IA locale
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
