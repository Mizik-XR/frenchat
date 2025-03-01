
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { PathSelectionDialog } from "./components/PathSelectionDialog";
import { CompanionDownloadDialog } from "./components/CompanionDownloadDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LLMProviderType } from "@/types/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoCircle, Server, ExternalLink } from "lucide-react";
import { useHuggingFace } from "@/hooks/useHuggingFace";

export interface LocalAIConfigProps {
  modelPath?: string;
  onModelPathChange?: (path: string) => void;
  provider?: LLMProviderType;
  onProviderChange?: (provider: LLMProviderType) => void;
  onSave?: () => void;
}

export function LocalAIConfig({
  modelPath = "",
  onModelPathChange = () => {},
  provider = "huggingface",
  onProviderChange = () => {},
  onSave
}: LocalAIConfigProps) {
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);
  const defaultModelPath = `${process.env.APPDATA || process.env.HOME}/filechat/models`;
  const [localModelPath, setLocalModelPath] = useState(modelPath || defaultModelPath);
  const [localProvider, setLocalProvider] = useState<LLMProviderType>(provider);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  const { checkLocalService, setLocalProviderConfig } = useHuggingFace();

  useEffect(() => {
    // Vérifier si le service local est disponible au chargement
    const checkService = async () => {
      const isAvailable = await checkLocalService();
      setServiceAvailable(isAvailable);
    };
    
    checkService();

    // Vérifier le service toutes les 30 secondes
    const interval = setInterval(checkService, 30000);
    return () => clearInterval(interval);
  }, [checkLocalService]);

  const handleLocalPathChange = (path: string) => {
    setLocalModelPath(path);
    onModelPathChange(path);
  };

  const handleLocalProviderChange = (newProvider: LLMProviderType) => {
    setLocalProvider(newProvider);
    onProviderChange(newProvider);
    setLocalProviderConfig(newProvider);
    
    toast({
      title: `Fournisseur local changé pour ${newProvider}`,
      description: "L'IA utilisera ce fournisseur pour les modèles locaux"
    });
  };

  const handlePathConfirm = () => {
    setPathDialogOpen(false);
    toast({
      title: "Chemin d'installation mis à jour",
      description: "Les modèles seront installés dans ce dossier"
    });
    
    if (onSave) {
      onSave();
    }
  };

  const handleDownloadCompanion = () => {
    setCompanionDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA locale</CardTitle>
          <CardDescription>
            Utilisez des modèles d'IA en local pour plus de confidentialité et de rapidité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {serviceAvailable !== null && (
              <Alert className={serviceAvailable ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"}>
                <Server className="h-4 w-4" />
                <AlertTitle>
                  {serviceAvailable 
                    ? "Service IA local détecté" 
                    : "Service IA local non disponible"}
                </AlertTitle>
                <AlertDescription>
                  {serviceAvailable 
                    ? "Votre système est correctement configuré pour utiliser l'IA en local." 
                    : "Le service n'est pas démarré ou n'est pas accessible. Vérifiez votre configuration ou téléchargez le Compagnon IA."}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fournisseur local
              </label>
              <div className="flex gap-2 pb-2">
                <Button
                  variant={localProvider === "huggingface" ? "default" : "outline"}
                  onClick={() => handleLocalProviderChange("huggingface")}
                  className="flex-1"
                >
                  Hugging Face (intégré)
                </Button>
                <Button
                  variant={localProvider === "ollama" ? "default" : "outline"}
                  onClick={() => handleLocalProviderChange("ollama")}
                  className="flex-1"
                >
                  Ollama (Windows/Mac/Linux)
                </Button>
              </div>
            </div>

            <Tabs defaultValue="configuration" className="mt-4">
              <TabsList className="mb-2">
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration">
                <ModelPathSelector
                  modelPath={localModelPath}
                  defaultModelPath={defaultModelPath}
                  onPathChange={handleLocalPathChange}
                  onPathSelect={() => setPathDialogOpen(true)}
                  onDownloadCompanion={handleDownloadCompanion}
                />
              </TabsContent>
              
              <TabsContent value="documentation" className="space-y-4">
                <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-100 dark:border-blue-900">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Guide d'utilisation de l'IA locale</h3>
                  
                  <div className="mt-2 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Option 1: Hugging Face (Service Python)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Ce service Python local utilise Mistral 7B par défaut et offre de bonnes performances.
                      </p>
                      <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                        <li>Démarrez le serveur avec <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">python serve_model.py</code></li>
                        <li>Requiert Python 3.8+ et environ 16 Go de RAM</li>
                        <li>Le téléchargement du modèle se fait automatiquement</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Option 2: Ollama</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Ollama est un service de modèles IA simples à installer et à utiliser sur différentes plateformes.
                      </p>
                      <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                        <li>
                          <a 
                            href="https://ollama.ai/download" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          >
                            Téléchargez Ollama
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Installez et lancez Ollama sur votre machine</li>
                        <li>Téléchargez un modèle avec <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ollama pull mistral</code></li>
                        <li>L'URL par défaut est <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">http://localhost:11434</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {onSave && (
            <div className="flex justify-end mt-4">
              <Button onClick={onSave}>
                Enregistrer la configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PathSelectionDialog
        open={pathDialogOpen}
        onOpenChange={setPathDialogOpen}
        modelPath={localModelPath}
        defaultModelPath={defaultModelPath}
        onPathChange={handleLocalPathChange}
        onConfirm={handlePathConfirm}
      />

      <CompanionDownloadDialog
        open={companionDialogOpen}
        onOpenChange={setCompanionDialogOpen}
      />
    </div>
  );
}
