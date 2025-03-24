
import { useEffect, useState  } from '@/core/reactInstance';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ExternalLink, ServerIcon } from "lucide-react";
import { 
  isOllamaAvailable, 
  configureOllama, 
  getAvailableOllamaModels,
  isPythonServerAvailable,
  configurePythonServer
} from "@/utils/environment/localAIDetection";
import { toast } from "sonner";

interface OllamaDetectorProps {
  onOllamaDetected: (detected: boolean) => void;
  onConfigureOllama: () => void;
}

export function OllamaDetector({ onOllamaDetected, onConfigureOllama }: OllamaDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isPythonAvailable, setIsPythonAvailable] = useState(false);
  const [checkingPython, setCheckingPython] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const detectOllama = async () => {
      if (!mounted) return;
      
      try {
        setIsDetecting(true);
        const available = await isOllamaAvailable();
        
        if (!mounted) return;
        
        setIsAvailable(available);
        onOllamaDetected(available);
        
        if (available) {
          const models = await getAvailableOllamaModels();
          if (mounted) {
            setAvailableModels(models || []);
          }
        } else if (retryCount < 3) {
          // Si Ollama n'est pas détecté, vérifier le serveur Python
          setCheckingPython(true);
          const pythonAvailable = await isPythonServerAvailable();
          if (mounted) {
            setIsPythonAvailable(pythonAvailable);
            setCheckingPython(false);
          }
        }
      } catch (error) {
        console.error("Erreur de détection d'Ollama:", error);
        if (mounted) {
          setIsAvailable(false);
          onOllamaDetected(false);
        }
      } finally {
        if (mounted) {
          setIsDetecting(false);
        }
      }
    };
    
    detectOllama();

    // Auto-retry 3 fois avec un délai croissant, utile si Ollama démarre lentement
    if (retryCount < 3) {
      const timer = setTimeout(() => {
        if (mounted && !isAvailable) {
          setRetryCount(prev => prev + 1);
          detectOllama();
        }
      }, 2000 * (retryCount + 1));
      
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    
    return () => {
      mounted = false;
    };
  }, [onOllamaDetected, retryCount, isAvailable]);

  const handleConfigureOllama = () => {
    configureOllama();
    onConfigureOllama();
    toast.success("Configuration avec Ollama effectuée avec succès");
  };
  
  const handleConfigurePython = () => {
    configurePythonServer();
    onConfigureOllama();
    toast.success("Configuration avec le serveur Python effectuée avec succès");
  };

  const handleRetryDetection = async () => {
    setIsDetecting(true);
    setRetryCount(0);
    try {
      const available = await isOllamaAvailable();
      setIsAvailable(available);
      onOllamaDetected(available);
      
      if (available) {
        const models = await getAvailableOllamaModels();
        setAvailableModels(models || []);
        toast.success("Ollama détecté avec succès");
      } else {
        // Si Ollama n'est pas détecté, vérifier le serveur Python
        setCheckingPython(true);
        const pythonAvailable = await isPythonServerAvailable();
        setIsPythonAvailable(pythonAvailable);
        setCheckingPython(false);
        
        if (pythonAvailable) {
          toast.success("Serveur Python local détecté");
        } else {
          toast.error("Aucun service d'IA local détecté");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de reconnexion à Ollama:", error);
      toast.error("Erreur de connexion aux services locaux");
    } finally {
      setIsDetecting(false);
    }
  };

  if (isDetecting) {
    return (
      <Alert className="bg-blue-50 border-blue-200 shadow-sm">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
          <AlertDescription className="text-blue-800">
            <h3 className="font-medium mb-1">Détection des services d'IA locale en cours...</h3>
            <p className="text-sm">Nous vérifions si Ollama ou un autre service d'IA est disponible sur votre système.</p>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (!isAvailable && isPythonAvailable) {
    return (
      <Alert className="bg-blue-50 border-blue-200 shadow-sm">
        <div className="flex items-start gap-3">
          <ServerIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-base font-medium text-blue-800 mb-1">
              Serveur Python détecté sur votre système
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Un serveur Python compatible est disponible pour l'IA locale.
            </p>
            <Button
              variant="outline" 
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={handleConfigurePython}
            >
              Configurer avec le serveur Python
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  if (!isAvailable) {
    return (
      <Alert className="bg-amber-50 border-amber-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0">ℹ️</div>
          <AlertDescription className="text-amber-800">
            <h3 className="font-medium mb-1">Service d'IA locale non détecté</h3>
            <p className="text-sm mb-2">
              Ollama est recommandé pour utiliser l'IA locale sans configuration complexe.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a 
                href="https://ollama.ai/download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
              >
                Télécharger et installer Ollama
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button 
                variant="outline"
                size="sm"
                className="mt-1 sm:mt-0 text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={handleRetryDetection}
              >
                {checkingPython ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  "Réessayer la détection"
                )}
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className="bg-green-50 border-green-200 shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-base font-medium text-green-800 mb-1">
            Ollama détecté sur votre système
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {availableModels.length > 0 
              ? `${availableModels.length} modèles disponibles: ${availableModels.slice(0, 3).join(', ')}${availableModels.length > 3 ? '...' : ''}`
              : "Ollama est installé mais aucun modèle n'est détecté. Utilisez 'ollama pull' pour télécharger des modèles."}
          </p>
          <Button
            variant="outline" 
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={handleConfigureOllama}
          >
            Configurer automatiquement avec Ollama
          </Button>
        </div>
      </div>
    </Alert>
  );
}
