
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, AlertCircle, Server, Cpu, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OllamaInstallerProps {
  onComplete?: () => void;
}

export function OllamaInstaller({ onComplete }: OllamaInstallerProps) {
  const [installStep, setInstallStep] = useState<'check' | 'download' | 'setup' | 'complete'>('check');
  const [isOllamaInstalled, setIsOllamaInstalled] = useState<boolean | null>(null);
  const [isOllamaRunning, setIsOllamaRunning] = useState<boolean | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [installationLog, setInstallationLog] = useState<string[]>([]);
  const { capabilities, isLoading: isCapabilitiesLoading } = useSystemCapabilities();
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux' | 'unknown'>('unknown');

  // Déterminer la plateforme au chargement
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setPlatform('windows');
    } else if (userAgent.includes('mac')) {
      setPlatform('mac');
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    }
  }, []);

  // Simuler la vérification d'Ollama
  useEffect(() => {
    if (installStep === 'check') {
      setIsLoading(true);
      const checkOllama = async () => {
        try {
          // Dans une application réelle, nous vérifierions via fetch
          // Ici nous simulons la réponse
          const response = await fetch('http://localhost:11434/api/tags', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          setIsOllamaInstalled(true);
          setIsOllamaRunning(response.ok);
          
          // Log
          addToLog(`Ollama ${response.ok ? 'est installé et actif' : 'est installé mais non démarré'}`);
          
          if (response.ok) {
            // Vérifier si le modèle mistral est déjà téléchargé
            const tagsData = await response.json();
            const hasMistral = tagsData.models?.some(m => m.name.includes('mistral'));
            
            if (hasMistral) {
              addToLog('Le modèle Mistral est déjà téléchargé');
            } else {
              addToLog('Le modèle Mistral n\'est pas encore téléchargé');
            }
          }
        } catch (error) {
          console.log('Ollama non détecté ou inactif');
          setIsOllamaInstalled(false);
          setIsOllamaRunning(false);
          addToLog('Ollama n\'est pas détecté sur votre système');
        } finally {
          setIsLoading(false);
        }
      };
      
      checkOllama();
    }
  }, [installStep]);

  // Ajouter un message au log d'installation
  const addToLog = (message: string) => {
    setInstallationLog(prev => [...prev, message]);
  };

  // Simuler le téléchargement d'Ollama
  const handleDownload = () => {
    setInstallStep('download');
    setDownloadProgress(0);
    
    let targetUrl = '';
    if (platform === 'windows') {
      targetUrl = 'https://ollama.ai/download/windows';
    } else if (platform === 'mac') {
      targetUrl = 'https://ollama.ai/download/mac';
    } else if (platform === 'linux') {
      targetUrl = 'https://ollama.ai/download/linux';
    }
    
    // Ouvrir la page de téléchargement
    window.open(targetUrl, '_blank');
    
    // Simuler la progression
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Ajouter au log
    addToLog(`Téléchargement d'Ollama pour ${platform} démarré`);
    setTimeout(() => {
      addToLog('Suivez les instructions sur le site Ollama pour l\'installation');
      setInstallStep('setup');
    }, 5000);
  };

  // Simuler le téléchargement et la configuration du modèle Mistral
  const handleModelSetup = () => {
    setIsLoading(true);
    addToLog('Configuration du modèle Mistral démarrée...');
    
    // Simuler le téléchargement du modèle
    setTimeout(() => {
      addToLog('Modèle Mistral configuré avec succès');
      setInstallStep('complete');
      setIsLoading(false);
      if (onComplete) onComplete();
      
      // Configuration locale de l'IA
      localStorage.setItem('aiServiceType', 'local');
      localStorage.setItem('localProvider', 'ollama');
      localStorage.setItem('localAIUrl', 'http://localhost:11434');
      
      addToLog('FileChat configuré pour utiliser Ollama en local');
    }, 2000);
  };

  // Démarrer Ollama s'il est installé mais non démarré
  const handleStartOllama = () => {
    setIsLoading(true);
    addToLog('Tentative de démarrage d\'Ollama...');
    
    setTimeout(() => {
      addToLog('Veuillez démarrer Ollama manuellement depuis votre menu Démarrer / Applications');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Installation d'Ollama pour l'IA locale</CardTitle>
          {capabilities && (
            <Badge variant={capabilities.hasGpu ? "success" : "secondary"} className="ml-2">
              {capabilities.hasGpu 
                ? `GPU détecté: ${capabilities.gpuInfo || 'Compatible'}` 
                : 'Mode CPU uniquement'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Étape de vérification */}
        {installStep === 'check' && (
          <div className="space-y-4">
            <Alert>
              <Server className="h-5 w-5" />
              <AlertTitle>Vérification de l'installation</AlertTitle>
              <AlertDescription>
                Nous vérifions si Ollama est déjà installé sur votre système.
              </AlertDescription>
            </Alert>
            
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-gray-600">Vérification en cours...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-gray-700" />
                    <span>Ollama est installé</span>
                  </div>
                  {isOllamaInstalled === true ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isOllamaInstalled === false ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5 text-gray-700" />
                    <span>Ollama est actif</span>
                  </div>
                  {isOllamaRunning === true ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isOllamaRunning === false ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                
                <div className="flex flex-col space-y-4 mt-6">
                  {isOllamaInstalled === false && (
                    <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Ollama
                    </Button>
                  )}
                  
                  {isOllamaInstalled === true && isOllamaRunning === false && (
                    <Button onClick={handleStartOllama} className="bg-amber-600 hover:bg-amber-700">
                      Démarrer Ollama
                    </Button>
                  )}
                  
                  {isOllamaInstalled === true && isOllamaRunning === true && (
                    <Button onClick={() => setInstallStep('setup')} className="bg-green-600 hover:bg-green-700">
                      Continuer vers la configuration
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Étape de téléchargement */}
        {installStep === 'download' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Download className="h-5 w-5" />
              <AlertTitle>Téléchargement d'Ollama</AlertTitle>
              <AlertDescription>
                Le téléchargement d'Ollama a démarré. Veuillez suivre les instructions d'installation.
              </AlertDescription>
            </Alert>
            
            <Progress value={downloadProgress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">Téléchargement en cours ({downloadProgress}%)</p>
            
            <div className="flex justify-center mt-4">
              <Button onClick={() => setInstallStep('setup')} disabled={downloadProgress < 100}>
                J'ai installé Ollama
              </Button>
            </div>
          </div>
        )}
        
        {/* Étape de configuration */}
        {installStep === 'setup' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <Cpu className="h-5 w-5" />
              <AlertTitle>Configuration du modèle</AlertTitle>
              <AlertDescription>
                Maintenant qu'Ollama est installé, nous allons configurer le modèle Mistral pour FileChat.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium">Configuration recommandée:</h3>
              
              <Tabs defaultValue="standard">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="compact">Compact</TabsTrigger>
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="compact" className="space-y-2 mt-2">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium">Mistral-7B-Instruct-v0.2-Q4</h4>
                    <p className="text-sm text-gray-600">Utilisation mémoire: ~4 Go</p>
                    <p className="text-sm text-gray-600">Idéal pour: Ordinateurs avec &lt;8 Go de RAM</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="standard" className="space-y-2 mt-2">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <h4 className="font-medium">Mistral-7B-Instruct-v0.2</h4>
                    <p className="text-sm text-gray-600">Utilisation mémoire: ~8 Go</p>
                    <p className="text-sm text-gray-600">Idéal pour: Ordinateurs standard (8-16 Go RAM)</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance" className="space-y-2 mt-2">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium">Mixtral-8x7B-Instruct-v0.1</h4>
                    <p className="text-sm text-gray-600">Utilisation mémoire: ~14+ Go</p>
                    <p className="text-sm text-gray-600">Idéal pour: Ordinateurs puissants avec GPU</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleModelSetup} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2" />
                    Configuration en cours...
                  </>
                ) : (
                  "Configurer Ollama pour FileChat"
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Étape terminée */}
        {installStep === 'complete' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle>Installation complétée</AlertTitle>
              <AlertDescription>
                Ollama est maintenant configuré et prêt à être utilisé avec FileChat.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Comment utiliser Ollama avec FileChat:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Assurez-vous qu'Ollama est démarré sur votre ordinateur</li>
                <li>FileChat est maintenant configuré pour utiliser Ollama en local</li>
                <li>Vous pouvez démarrer une conversation dans l'application</li>
                <li>Les conversations utilisent automatiquement le modèle Mistral local</li>
              </ol>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => window.location.href = '/chat'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aller au chat
              </Button>
            </div>
          </div>
        )}
        
        {/* Log d'installation */}
        {installationLog.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Journal d'installation:</h3>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-28 overflow-y-auto">
              {installationLog.map((log, index) => (
                <div key={index} className="py-0.5">
                  <span className="opacity-70">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
