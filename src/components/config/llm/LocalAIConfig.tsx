
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModelPathSelector } from "./components/ModelPathSelector";
import { PathSelectionDialog } from "./components/PathSelectionDialog";
import { CompanionDownloadDialog } from "./components/CompanionDownloadDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LLMProviderType } from "@/types/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { AlertTriangle, Info, CheckCircle, Server, Globe, Cpu } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  
  // Intégration avec useHuggingFace pour récupérer et définir le type de service
  const { 
    serviceType, 
    localAIUrl, 
    hasWebGPU, 
    checkLocalService,
    setServiceType
  } = useHuggingFace();

  const [localServerAvailable, setLocalServerAvailable] = useState<boolean | null>(null);
  
  // Vérifier la disponibilité du serveur local au chargement
  useEffect(() => {
    const checkServer = async () => {
      const isAvailable = await checkLocalService();
      setLocalServerAvailable(isAvailable);
    };
    
    checkServer();
    
    // Vérifier périodiquement
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, [checkLocalService]);

  const handleLocalPathChange = (path: string) => {
    setLocalModelPath(path);
    onModelPathChange(path);
  };

  const handleLocalProviderChange = (newProvider: LLMProviderType) => {
    setLocalProvider(newProvider);
    onProviderChange(newProvider);
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

  const handleServiceTypeChange = (type: 'local' | 'cloud' | 'browser' | 'auto') => {
    setServiceType(type);
    toast({
      title: `Mode IA changé pour: ${type}`,
      description: type === 'auto' 
        ? "Le meilleur mode sera détecté automatiquement" 
        : `L'IA utilisera le mode ${type} pour les réponses`
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA</CardTitle>
          <CardDescription>
            Choisissez où et comment exécuter les modèles d'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode d'exécution de l'IA */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mode d'exécution</h3>
            <Tabs value={serviceType === 'auto' ? 'auto' : serviceType} onValueChange={(v) => handleServiceTypeChange(v as any)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="auto" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Auto</span>
                </TabsTrigger>
                <TabsTrigger value="browser" className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  <span>Navigateur</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  <span>Local</span>
                </TabsTrigger>
                <TabsTrigger value="cloud" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>Cloud</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="auto">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Mode automatique</AlertTitle>
                  <AlertDescription>
                    FileChat détectera automatiquement la meilleure option disponible pour exécuter les modèles d'IA, en privilégiant
                    la performance et la confidentialité.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`border ${localServerAvailable ? 'border-green-200' : 'border-gray-200'}`}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Serveur local
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600">
                        {localServerAvailable 
                          ? '✅ Disponible' 
                          : '❌ Non disponible'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border ${hasWebGPU ? 'border-green-200' : 'border-gray-200'}`}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        WebGPU
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600">
                        {hasWebGPU 
                          ? '✅ Disponible' 
                          : '❌ Non disponible'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-green-200">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Cloud
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600">
                        ✅ Toujours disponible
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="browser">
                <Alert variant={hasWebGPU ? "default" : "destructive"}>
                  {hasWebGPU ? <Info className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>Exécution dans le navigateur</AlertTitle>
                  <AlertDescription>
                    {hasWebGPU 
                      ? "Les modèles s'exécuteront directement dans votre navigateur grâce à WebGPU, sans installation supplémentaire." 
                      : "Votre navigateur ne supporte pas WebGPU. Essayez Chrome ou Edge récent, ou utilisez un autre mode d'exécution."}
                  </AlertDescription>
                </Alert>
                
                {hasWebGPU && (
                  <div className="mt-4 text-sm space-y-2">
                    <p>Avantages:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Aucune installation supplémentaire requise</li>
                      <li>Confidentialité maximale - tout reste sur votre appareil</li>
                      <li>Fonctionne hors-ligne après le premier chargement</li>
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="local">
                <Alert variant={localServerAvailable ? "default" : "destructive"}>
                  {localServerAvailable ? <Info className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>Serveur IA local</AlertTitle>
                  <AlertDescription>
                    {localServerAvailable 
                      ? "Le serveur IA local est disponible et opérationnel." 
                      : "Le serveur IA local n'est pas détecté. Assurez-vous qu'il est démarré sur le port correct."}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
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

                  <ModelPathSelector
                    modelPath={localModelPath}
                    defaultModelPath={defaultModelPath}
                    onPathChange={handleLocalPathChange}
                    onPathSelect={() => setPathDialogOpen(true)}
                    onDownloadCompanion={handleDownloadCompanion}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="cloud">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Service Cloud</AlertTitle>
                  <AlertDescription>
                    Les modèles s'exécuteront sur nos serveurs cloud. Aucune installation supplémentaire n'est requise.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 text-sm space-y-2">
                  <p>Avantages:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Aucune installation ou configuration requise</li>
                    <li>Performances constantes quel que soit votre appareil</li>
                    <li>Accès aux modèles les plus récents</li>
                  </ul>
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
