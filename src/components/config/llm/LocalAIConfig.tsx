
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LLMProviderType } from "@/types/config";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { ModelPathWizard } from "./components/wizard/ModelPathWizard";
import { LOCAL_MODELS, CLOUD_MODELS } from "./types";
import { ModelSelector } from "./ModelSelector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudIcon, ServerIcon, CheckCircle, Info, ExternalLink } from "lucide-react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface LocalAIConfigProps {
  modelPath: string;
  provider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
  onModelPathChange: (path: string) => void;
  onSave: () => void;
  defaultMode?: "local" | "cloud";
}

export const LocalAIConfig = ({
  modelPath,
  provider,
  onProviderChange,
  onModelPathChange,
  onSave,
  defaultMode = "local"
}: LocalAIConfigProps) => {
  const [mode, setMode] = useState<"local" | "cloud">(defaultMode);
  const [localSelectedModel, setLocalSelectedModel] = useState<string>("mistral-local");
  const [cloudSelectedModel, setCloudSelectedModel] = useState<string>("huggingface/mixtral");
  const [showPathWizard, setShowPathWizard] = useState(false);
  const { capabilities } = useSystemCapabilities();
  const [isOllamaDetected, setIsOllamaDetected] = useState(false);
  
  // Vérifier si Ollama est disponible
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/version', { 
          signal: AbortSignal.timeout(2000) 
        });
        setIsOllamaDetected(response.ok);
        
        // Si Ollama est détecté, le définir comme provider par défaut
        if (response.ok && provider !== 'ollama') {
          onProviderChange('ollama');
        }
      } catch (e) {
        setIsOllamaDetected(false);
      }
    };
    
    checkOllama();
  }, []);

  // Synchroniser le provider avec les sélections de modèle
  useEffect(() => {
    if (mode === "local") {
      // Extraire le provider à partir de l'ID du modèle local
      const modelId = localSelectedModel;
      let newProvider: LLMProviderType = "mistral"; // Par défaut
      
      if (modelId.includes("mistral")) {
        newProvider = "mistral";
      } else if (modelId.includes("deepseek")) {
        newProvider = "deepseek";
      } else if (modelId.includes("qwen")) {
        newProvider = "qwen";
      } else if (modelId.includes("ollama")) {
        newProvider = "ollama";
      } else {
        newProvider = "local";
      }
      
      if (newProvider !== provider) {
        onProviderChange(newProvider);
      }
    } else {
      // Mode cloud
      const modelId = cloudSelectedModel;
      let newProvider: LLMProviderType = "huggingface"; // Par défaut
      
      if (modelId.includes("openai")) {
        newProvider = "openai";
      } else if (modelId.includes("anthropic")) {
        newProvider = "anthropic";
      } else if (modelId.includes("perplexity")) {
        newProvider = "perplexity";
      } else {
        newProvider = "huggingface";
      }
      
      if (newProvider !== provider) {
        onProviderChange(newProvider);
      }
    }
  }, [mode, localSelectedModel, cloudSelectedModel, onProviderChange, provider]);

  const handleSave = () => {
    onSave();
  };

  const handleModeChange = (newMode: "local" | "cloud") => {
    setMode(newMode);
  };

  const handleLocalModelSelect = (modelId: string) => {
    setLocalSelectedModel(modelId);
  };

  const handleCloudModelSelect = (modelId: string) => {
    setCloudSelectedModel(modelId);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
          <CardTitle className="text-lg text-purple-800">Mode de fonctionnement</CardTitle>
          <CardDescription className="text-purple-700">
            Choisissez comment vous souhaitez utiliser les modèles d'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs 
            defaultValue={mode} 
            value={mode}
            onValueChange={(value) => handleModeChange(value as "local" | "cloud")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="local" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <ServerIcon className="h-4 w-4" />
                Modèles locaux
              </TabsTrigger>
              <TabsTrigger 
                value="cloud" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <CloudIcon className="h-4 w-4" />
                API Cloud
              </TabsTrigger>
            </TabsList>
            
            <p className="text-sm text-gray-600 mb-2">
              {mode === "local" 
                ? "Les modèles locaux s'exécutent sur votre machine sans nécessiter de connexion internet constante" 
                : "Les API cloud utilisent des services en ligne et nécessitent une connexion internet"}
            </p>
          </Tabs>
        </CardContent>
      </Card>

      {isOllamaDetected && (
        <Card className="border-green-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-base font-medium text-green-800 mb-1">
                  Ollama détecté sur votre système
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Ollama est installé et fonctionne sur votre machine. C'est la méthode recommandée pour utiliser l'IA locale.
                </p>
                <Button
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => {
                    localStorage.setItem('localProvider', 'ollama');
                    localStorage.setItem('localAIUrl', 'http://localhost:11434');
                    localStorage.setItem('aiServiceType', 'local');
                    onProviderChange('ollama');
                    alert("Configuration avec Ollama terminée! L'application utilisera maintenant Ollama pour l'IA locale.");
                  }}
                >
                  Configurer automatiquement avec Ollama
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
          <CardTitle className="text-lg text-purple-800">
            {mode === "local" ? "Sélection du modèle local" : "Sélection du service cloud"}
          </CardTitle>
          <CardDescription className="text-purple-700">
            {mode === "local" 
              ? "Choisissez un modèle d'IA open source à utiliser localement" 
              : "Sélectionnez un fournisseur d'API pour accéder aux modèles dans le cloud"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {mode === "local" ? (
            <div className="space-y-6">
              <ModelSelector
                models={LOCAL_MODELS}
                selectedModel={localSelectedModel}
                onModelSelect={handleLocalModelSelect}
                onModelAdd={(model) => {}}
                label="Modèle d'IA locale"
                type="local"
              />
              
              {localSelectedModel.includes('ollama') ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">Configuration Ollama</h4>
                      <p className="text-sm text-gray-600 mt-1 mb-2">
                        Ollama gère automatiquement les modèles locaux. Vous n'avez pas besoin de spécifier un chemin.
                      </p>
                      <a 
                        href="https://ollama.com/library" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Voir la bibliothèque de modèles Ollama
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h4 className="font-medium text-blue-800 mb-1">Chemin du modèle local</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Indiquez le chemin vers le dossier contenant les fichiers du modèle sur votre ordinateur
                    </p>
                    <div className="flex gap-2">
                      <ModelPathSelector
                        modelPath={modelPath}
                        onPathChange={onModelPathChange}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPathWizard(true)}
                      >
                        Assistant
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ModelSelector
              models={CLOUD_MODELS}
              selectedModel={cloudSelectedModel}
              onModelSelect={handleCloudModelSelect}
              onModelAdd={(model) => {}}
              label="Service d'IA cloud"
              type="cloud"
            />
          )}
        </CardContent>
      </Card>

      <Button
        type="button"
        onClick={handleSave}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Enregistrer la configuration
      </Button>

      {showPathWizard && (
        <ModelPathWizard
          isOpen={showPathWizard}
          onClose={() => setShowPathWizard(false)}
          onPathSelected={onModelPathChange}
          defaultPath={modelPath}
        />
      )}
    </div>
  );
};
