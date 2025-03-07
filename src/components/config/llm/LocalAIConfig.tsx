
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LLMProviderType } from "@/types/config";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { ModelPathWizard } from "./components/wizard/ModelPathWizard";
import { LOCAL_MODELS, CLOUD_MODELS } from "./types";
import { ModelSelector } from "./ModelSelector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CloudIcon, ServerIcon, CheckCircle, Info, ExternalLink, Lightbulb } from "lucide-react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OllamaDetector } from "./components/OllamaDetector";
import { isLocalAIEnvironmentCompatible } from "@/utils/environment/localAIDetection";

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
  const [isLocalCompatible, setIsLocalCompatible] = useState(true);
  
  useEffect(() => {
    // Vérifier si l'environnement est compatible avec l'IA locale
    setIsLocalCompatible(isLocalAIEnvironmentCompatible());
  }, []);

  useEffect(() => {
    if (mode === "local") {
      const modelId = localSelectedModel;
      let newProvider: LLMProviderType = "mistral";
      
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
      const modelId = cloudSelectedModel;
      let newProvider: LLMProviderType = "huggingface";
      
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

  const handleOllamaDetected = (detected: boolean) => {
    setIsOllamaDetected(detected);
    if (detected && provider !== 'ollama') {
      setLocalSelectedModel("ollama");
    }
  };

  const handleConfigureOllama = () => {
    onProviderChange('ollama');
    alert("Configuration avec Ollama terminée! L'application utilisera maintenant Ollama pour l'IA locale.");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Alert className="bg-purple-50 border-purple-200 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-700 mt-0.5 flex-shrink-0" />
          <AlertDescription className="text-purple-800">
            <h3 className="font-medium mb-1">Modèles Open Source</h3>
            <p className="text-sm">
              Ces modèles sont gratuits, open source, et peuvent être exécutés localement via Ollama 
              ou via des API gratuites comme Hugging Face.
            </p>
          </AlertDescription>
        </div>
      </Alert>

      {!isLocalCompatible && (
        <Alert className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <AlertDescription className="text-amber-800">
              <h3 className="font-medium mb-1">Mode IA locale limité</h3>
              <p className="text-sm">
                Vous utilisez l'application en mode cloud. Pour utiliser l'IA locale, 
                vous devez accéder à l'application depuis votre navigateur local et installer Ollama.
              </p>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card className="border-purple-200 shadow-sm overflow-visible">
        <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
          <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Mode de fonctionnement
          </CardTitle>
          <CardDescription className="text-purple-700">
            Choisissez comment vous souhaitez utiliser les modèles d'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${mode === "local" ? "bg-green-100" : "bg-gray-100"}`}>
                  <ServerIcon className={`h-5 w-5 ${mode === "local" ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="font-medium">Modèles locaux</p>
                  <p className="text-xs text-gray-500">Exécution sur votre machine, sans connexion internet constante</p>
                </div>
              </div>
              <Switch 
                checked={mode === "local"} 
                onCheckedChange={(checked) => handleModeChange(checked ? "local" : "cloud")}
                className="data-[state=checked]:bg-green-600"
                disabled={!isLocalCompatible}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${mode === "cloud" ? "bg-blue-100" : "bg-gray-100"}`}>
                  <CloudIcon className={`h-5 w-5 ${mode === "cloud" ? "text-blue-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="font-medium">API Cloud</p>
                  <p className="text-xs text-gray-500">Services en ligne, nécessitent une connexion internet</p>
                </div>
              </div>
              <Switch 
                checked={mode === "cloud"} 
                onCheckedChange={(checked) => handleModeChange(checked ? "cloud" : "local")}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <OllamaDetector 
        onOllamaDetected={handleOllamaDetected} 
        onConfigureOllama={handleConfigureOllama}
      />

      <TabsContent value={mode} forceMount className="mt-0">
        {mode === "local" ? (
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
              <CardTitle className="text-lg text-green-800">
                Sélection du modèle local
              </CardTitle>
              <CardDescription className="text-green-700">
                Choisissez un modèle d'IA open source à utiliser localement
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                          href="https://ollama.ai/library" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          Voir la bibliothèque de modèles Ollama
                          <ExternalLink className="h-3 w-3 ml-1" />
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
                          onOpenWizard={() => setShowPathWizard(true)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-3">
              <CardTitle className="text-lg text-blue-800">
                Sélection du service cloud
              </CardTitle>
              <CardDescription className="text-blue-700">
                Sélectionnez un fournisseur d'API pour accéder aux modèles dans le cloud
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ModelSelector
                models={CLOUD_MODELS}
                selectedModel={cloudSelectedModel}
                onModelSelect={handleCloudModelSelect}
                onModelAdd={(model) => {}}
                label="Service d'IA cloud"
                type="cloud"
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>

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
