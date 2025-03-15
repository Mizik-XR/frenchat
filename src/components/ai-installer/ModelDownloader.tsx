
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleCheck, Database, AlertCircle, Download, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemCapabilities } from "@/types/system";
import { getOllamaModels, pullOllamaModel } from "@/hooks/ai/ollamaService";
import { toast } from "@/hooks/use-toast";

interface ModelDownloaderProps {
  onComplete: () => void;
  capabilities?: SystemCapabilities;
  addLogMessage: (message: string) => void;
}

export function ModelDownloader({ onComplete, capabilities, addLogMessage }: ModelDownloaderProps) {
  const [downloadStep, setDownloadStep] = useState<'modelSelection' | 'downloading' | 'complete'>('modelSelection');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Vérifier les modèles déjà téléchargés
  useEffect(() => {
    const checkExistingModels = async () => {
      setIsLoading(true);
      addLogMessage("🔍 Recherche des modèles disponibles...");
      
      try {
        const ollamaUrl = localStorage.getItem('localAIUrl') || 'http://localhost:11434';
        const models = await getOllamaModels(ollamaUrl);
        
        if (models && Array.isArray(models)) {
          const modelNames = models.map(m => typeof m === 'string' ? m : m.name);
          setAvailableModels(modelNames);
          
          // Vérifier si les modèles recommandés sont déjà téléchargés
          const hasMistral = modelNames.some(name => name.toLowerCase().includes('mistral'));
          const hasMixtral = modelNames.some(name => name.toLowerCase().includes('mixtral'));
          
          if (hasMistral || hasMixtral) {
            addLogMessage(`✅ Modèle(s) déjà installé(s): ${hasMistral ? 'Mistral' : ''} ${hasMixtral ? 'Mixtral' : ''}`);
            
            // Sélectionner automatiquement le modèle existant
            if (hasMixtral) {
              setSelectedModel('mixtral');
            } else if (hasMistral) {
              setSelectedModel('mistral');
            }
          } else {
            addLogMessage("ℹ️ Aucun modèle recommandé n'est encore installé");
          }
        } else {
          addLogMessage("ℹ️ Aucun modèle détecté");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des modèles:", error);
        addLogMessage("❌ Erreur lors de la recherche des modèles");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingModels();
  }, [addLogMessage]);
  
  // Déterminer le modèle recommandé en fonction du matériel
  const getRecommendedModel = () => {
    if (!capabilities) return null;
    
    if (capabilities.hasGpu && capabilities.memoryInGB >= 16) {
      return {
        id: "mixtral",
        name: "Mixtral-8x7B-Instruct-v0.1",
        size: "~14 Go",
        recommended: true,
        memory: "16+ Go RAM",
        requirements: "GPU recommandé"
      };
    } else if (capabilities.memoryInGB >= 8) {
      return {
        id: "mistral",
        name: "Mistral-7B-Instruct-v0.2",
        size: "~7 Go",
        recommended: true,
        memory: "8+ Go RAM",
        requirements: "CPU or GPU"
      };
    } else {
      return {
        id: "mistral-q4",
        name: "Mistral-7B-Instruct-v0.2-Q4",
        size: "~4 Go",
        recommended: true,
        memory: "4+ Go RAM",
        requirements: "CPU uniquement"
      };
    }
  };
  
  // Liste des modèles disponibles
  const models = [
    {
      id: "mixtral",
      name: "Mixtral-8x7B-Instruct-v0.1",
      size: "~14 Go",
      recommended: getRecommendedModel()?.id === "mixtral",
      memory: "16+ Go RAM",
      requirements: "GPU recommandé"
    },
    {
      id: "mistral",
      name: "Mistral-7B-Instruct-v0.2",
      size: "~7 Go",
      recommended: getRecommendedModel()?.id === "mistral",
      memory: "8+ Go RAM",
      requirements: "CPU or GPU"
    },
    {
      id: "mistral-q4",
      name: "Mistral-7B-Instruct-v0.2-Q4",
      size: "~4 Go",
      recommended: getRecommendedModel()?.id === "mistral-q4",
      memory: "4+ Go RAM",
      requirements: "CPU uniquement"
    }
  ];
  
  // Vérifier si un modèle est déjà téléchargé
  const isModelAlreadyDownloaded = (modelId: string): boolean => {
    if (modelId === 'mixtral') {
      return availableModels.some(name => name.toLowerCase().includes('mixtral'));
    } else if (modelId === 'mistral' || modelId === 'mistral-q4') {
      return availableModels.some(name => name.toLowerCase().includes('mistral'));
    }
    return false;
  };
  
  // Démarrer le téléchargement du modèle
  const handleDownloadModel = async () => {
    if (!selectedModel) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un modèle avant de continuer.",
        variant: "destructive"
      });
      return;
    }
    
    setDownloadStep('downloading');
    setDownloadProgress(0);
    
    // Déterminer le nom du modèle Ollama
    let ollamaModelName = '';
    if (selectedModel === 'mixtral') {
      ollamaModelName = 'mixtral';
      addLogMessage("🚀 Démarrage du téléchargement de Mixtral...");
    } else if (selectedModel === 'mistral') {
      ollamaModelName = 'mistral';
      addLogMessage("🚀 Démarrage du téléchargement de Mistral...");
    } else if (selectedModel === 'mistral-q4') {
      ollamaModelName = 'mistral:4b';
      addLogMessage("🚀 Démarrage du téléchargement de Mistral (quantifié 4-bit)...");
    }
    
    // Simuler le téléchargement
    const simulateDownload = () => {
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 1;
        });
      }, 500);
      
      return () => clearInterval(interval);
    };
    
    // Démarrer la simulation de téléchargement
    const clearSimulation = simulateDownload();
    
    try {
      // Tenter de télécharger le modèle avec Ollama
      const ollamaUrl = localStorage.getItem('localAIUrl') || 'http://localhost:11434';
      
      addLogMessage(`📥 Téléchargement du modèle ${ollamaModelName}...`);
      const result = await pullOllamaModel(ollamaUrl, ollamaModelName);
      
      if (result.success) {
        addLogMessage(`✅ Le modèle ${ollamaModelName} a été téléchargé avec succès`);
        
        // Configurer l'application pour utiliser ce modèle
        localStorage.setItem('defaultModel', ollamaModelName);
        
        setDownloadProgress(100);
        setTimeout(() => {
          setDownloadStep('complete');
        }, 1000);
      } else {
        addLogMessage(`❌ Erreur lors du téléchargement du modèle: ${result.error}`);
        toast({
          title: "Erreur de téléchargement",
          description: `Impossible de télécharger le modèle: ${result.error}`,
          variant: "destructive"
        });
        clearSimulation();
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      addLogMessage(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur s'est produite lors du téléchargement du modèle.",
        variant: "destructive"
      });
      clearSimulation();
    }
  };
  
  // Marquer comme complété (pour les modèles déjà téléchargés)
  const handleSetComplete = () => {
    localStorage.setItem('defaultModel', selectedModel);
    addLogMessage(`✅ Modèle ${selectedModel} configuré comme modèle par défaut`);
    setDownloadStep('complete');
  };
  
  // Finaliser la configuration
  const handleFinish = () => {
    addLogMessage("🎉 Configuration du modèle terminée avec succès");
    onComplete();
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Téléchargement du modèle IA</h3>
          {capabilities?.hasGpu && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              GPU détecté: performances optimales
            </Badge>
          )}
        </div>
        
        {/* Étape de sélection du modèle */}
        {downloadStep === 'modelSelection' && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Database className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Sélectionnez le modèle IA à utiliser avec FileChat.
              </AlertDescription>
            </Alert>
            
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2 py-4">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-gray-600">Recherche des modèles existants...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs defaultValue="recommended" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="recommended">Recommandé</TabsTrigger>
                    <TabsTrigger value="all">Tous les modèles</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recommended" className="space-y-4 pt-4">
                    {models
                      .filter(model => model.recommended)
                      .map((model) => (
                        <div 
                          key={model.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer ${
                            selectedModel === model.id 
                              ? "border-primary bg-primary/5" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedModel(model.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-gray-500">
                                Taille: {model.size} • Mémoire: {model.memory}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {model.requirements}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-2">
                                Recommandé
                              </Badge>
                              {isModelAlreadyDownloaded(model.id) && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Déjà téléchargé
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="all" className="space-y-4 pt-4">
                    {models.map((model) => (
                      <div 
                        key={model.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer ${
                          selectedModel === model.id 
                            ? "border-primary bg-primary/5" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{model.name}</h4>
                            <p className="text-sm text-gray-500">
                              Taille: {model.size} • Mémoire: {model.memory}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {model.requirements}
                            </p>
                          </div>
                          <div>
                            {model.recommended && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-2 block">
                                Recommandé
                              </Badge>
                            )}
                            {isModelAlreadyDownloaded(model.id) && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Déjà téléchargé
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-3 pt-2">
                  {isModelAlreadyDownloaded(selectedModel) ? (
                    <Button 
                      onClick={handleSetComplete}
                      disabled={!selectedModel}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Utiliser le modèle existant
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDownloadModel}
                      disabled={!selectedModel}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le modèle
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Étape de téléchargement */}
        {downloadStep === 'downloading' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Download className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Téléchargement du modèle en cours. Cela peut prendre plusieurs minutes.
              </AlertDescription>
            </Alert>
            
            <Progress value={downloadProgress} className="w-full" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Téléchargement {downloadProgress}%</p>
              <p className="text-sm text-gray-600">
                {selectedModel === 'mixtral' && `Environ 14 Go / 14 Go`}
                {selectedModel === 'mistral' && `Environ ${Math.round(downloadProgress * 0.07)} Go / 7 Go`}
                {selectedModel === 'mistral-q4' && `Environ ${Math.round(downloadProgress * 0.04)} Go / 4 Go`}
              </p>
            </div>
            
            {downloadProgress < 100 && (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Ne fermez pas cette fenêtre pendant le téléchargement. Cette opération peut prendre plusieurs minutes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Étape terminée */}
        {downloadStep === 'complete' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CircleCheck className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Le modèle a été configuré avec succès !
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Modèle configuré:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  {selectedModel === 'mixtral' && "Mixtral-8x7B-Instruct-v0.1"}
                  {selectedModel === 'mistral' && "Mistral-7B-Instruct-v0.2"}
                  {selectedModel === 'mistral-q4' && "Mistral-7B-Instruct-v0.2-Q4"}
                </li>
                <li>Le modèle est maintenant disponible pour utilisation avec FileChat</li>
                <li>L'IA locale est maintenant votre moteur de traitement par défaut</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                Terminer la configuration
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
