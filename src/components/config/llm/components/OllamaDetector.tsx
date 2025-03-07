
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { isOllamaAvailable, configureOllama, getAvailableOllamaModels } from "@/utils/environment/localAIDetection";

interface OllamaDetectorProps {
  onOllamaDetected: (detected: boolean) => void;
  onConfigureOllama: () => void;
}

export function OllamaDetector({ onOllamaDetected, onConfigureOllama }: OllamaDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const detectOllama = async () => {
      try {
        setIsDetecting(true);
        const available = await isOllamaAvailable();
        setIsAvailable(available);
        onOllamaDetected(available);
        
        if (available) {
          const models = await getAvailableOllamaModels();
          setAvailableModels(models || []);
        }
      } catch (error) {
        console.error("Erreur de détection d'Ollama:", error);
        setIsAvailable(false);
        onOllamaDetected(false);
      } finally {
        setIsDetecting(false);
      }
    };
    
    detectOllama();
  }, [onOllamaDetected]);

  const handleConfigureOllama = () => {
    configureOllama();
    onConfigureOllama();
  };

  if (isDetecting) {
    return (
      <Alert className="bg-blue-50 border-blue-200 shadow-sm">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
          <AlertDescription className="text-blue-800">
            <h3 className="font-medium mb-1">Détection d'Ollama en cours...</h3>
            <p className="text-sm">Nous vérifions si Ollama est disponible sur votre système.</p>
          </AlertDescription>
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
            <h3 className="font-medium mb-1">Ollama n'est pas détecté</h3>
            <p className="text-sm mb-2">
              Ollama est recommandé pour utiliser l'IA locale sans configuration complexe.
            </p>
            <a 
              href="https://ollama.ai/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
            >
              Télécharger et installer Ollama
              <ExternalLink className="h-3 w-3" />
            </a>
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
