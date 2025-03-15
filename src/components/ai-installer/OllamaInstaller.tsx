
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle, AlertCircle, Server, Cpu, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SystemCapabilities } from "@/types/system";
import { getPlatform } from "@/utils/platformUtils";
import { isOllamaAvailable } from "@/utils/environment/localAIDetection";
import { toast } from "@/hooks/use-toast";

interface OllamaInstallerProps {
  onComplete: () => void;
  capabilities?: SystemCapabilities;
  addLogMessage: (message: string) => void;
}

export function OllamaInstaller({ onComplete, capabilities, addLogMessage }: OllamaInstallerProps) {
  const [installStep, setInstallStep] = useState<'check' | 'download' | 'install' | 'test' | 'complete'>('check');
  const [isOllamaInstalled, setIsOllamaInstalled] = useState<boolean | null>(null);
  const [isOllamaRunning, setIsOllamaRunning] = useState<boolean | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux' | 'unknown'>('unknown');
  
  // Déterminer la plateforme au chargement
  useEffect(() => {
    setPlatform(getPlatform());
  }, []);
  
  // Vérifier si Ollama est déjà installé
  useEffect(() => {
    if (installStep === 'check') {
      const checkOllama = async () => {
        setIsLoading(true);
        addLogMessage("🔍 Vérification de l'installation d'Ollama...");
        try {
          const isAvailable = await isOllamaAvailable();
          setIsOllamaInstalled(isAvailable);
          setIsOllamaRunning(isAvailable);
          
          if (isAvailable) {
            addLogMessage("✅ Ollama est déjà installé et fonctionne");
            setInstallStep('complete');
          } else {
            addLogMessage("ℹ️ Ollama n'est pas installé ou n'est pas en cours d'exécution");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification d'Ollama:", error);
          addLogMessage("❌ Erreur lors de la vérification d'Ollama");
          setIsOllamaInstalled(false);
          setIsOllamaRunning(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkOllama();
    }
  }, [installStep, addLogMessage]);
  
  // Télécharger Ollama
  const handleDownload = () => {
    setInstallStep('download');
    setDownloadProgress(0);
    addLogMessage("📥 Démarrage du téléchargement d'Ollama...");
    
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
    
    setTimeout(() => {
      addLogMessage(`📦 Téléchargement d'Ollama pour ${platform} terminé`);
      setInstallStep('install');
    }, 5000);
  };
  
  // Installation manuelle d'Ollama
  const handleManualInstall = () => {
    setInstallStep('install');
    addLogMessage("🔧 Installation manuelle d'Ollama...");
  };
  
  // Tester Ollama
  const handleTestOllama = async () => {
    setIsLoading(true);
    addLogMessage("🧪 Test de la connexion à Ollama...");
    
    try {
      const isAvailable = await isOllamaAvailable();
      
      if (isAvailable) {
        addLogMessage("✅ Ollama est correctement installé et fonctionne");
        setIsOllamaRunning(true);
        setInstallStep('complete');
        
        // Configuration Ollama
        localStorage.setItem('localProvider', 'ollama');
        localStorage.setItem('localAIUrl', 'http://localhost:11434');
        localStorage.setItem('aiServiceType', 'local');
        
        toast({
          title: "Ollama détecté",
          description: "Ollama est correctement installé et configuré."
        });
      } else {
        addLogMessage("❌ Ollama n'est pas accessible. Vérifiez qu'il est en cours d'exécution.");
        setIsOllamaRunning(false);
        
        toast({
          title: "Ollama non détecté",
          description: "Assurez-vous qu'Ollama est bien installé et en cours d'exécution.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du test d'Ollama:", error);
      addLogMessage("❌ Erreur lors du test de connexion à Ollama");
      setIsOllamaRunning(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finaliser l'installation
  const handleFinish = () => {
    addLogMessage("🎉 Installation d'Ollama terminée avec succès");
    onComplete();
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Installation d'Ollama</h3>
          {capabilities?.hasGpu && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              GPU détecté
            </Badge>
          )}
        </div>
        
        {/* Étape de vérification */}
        {installStep === 'check' && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Server className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Nous vérifions si Ollama est déjà installé sur votre système.
              </AlertDescription>
            </Alert>
            
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2 py-4">
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isOllamaInstalled === false ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-5 w-5 text-gray-700" />
                    <span>Ollama est actif</span>
                  </div>
                  {isOllamaRunning === true ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isOllamaRunning === false ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 mt-4">
                  {isOllamaInstalled === false && !isLoading && (
                    <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Ollama
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
              <Download className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Téléchargement d'Ollama en cours. Suivez les instructions d'installation.
              </AlertDescription>
            </Alert>
            
            <Progress value={downloadProgress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">Téléchargement {downloadProgress}%</p>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => setInstallStep('install')} 
                disabled={downloadProgress < 100}
              >
                Continuer vers l'installation
              </Button>
            </div>
          </div>
        )}
        
        {/* Étape d'installation */}
        {installStep === 'install' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Server className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Suivez les instructions ci-dessous pour installer Ollama sur {platform}
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium">Instructions d'installation:</h4>
              
              {platform === 'windows' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Exécutez le fichier <code className="bg-gray-200 px-1 rounded">OllamaSetup.exe</code> téléchargé</li>
                  <li>Si un avertissement apparaît, cliquez sur "Exécuter quand même"</li>
                  <li>Suivez les étapes de l'assistant d'installation</li>
                  <li>Une fois l'installation terminée, Ollama devrait démarrer automatiquement</li>
                  <li>Vous pouvez voir l'icône d'Ollama dans la barre des tâches</li>
                </ol>
              )}
              
              {platform === 'mac' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Ouvrez le fichier <code className="bg-gray-200 px-1 rounded">Ollama.dmg</code> téléchargé</li>
                  <li>Faites glisser l'application Ollama dans le dossier Applications</li>
                  <li>Ouvrez Ollama depuis le dossier Applications</li>
                  <li>Si un avertissement de sécurité apparaît, ouvrez Préférences Système → Sécurité et confidentialité, puis cliquez sur "Ouvrir quand même"</li>
                </ol>
              )}
              
              {platform === 'linux' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Ouvrez un terminal</li>
                  <li>Exécutez la commande : <code className="bg-gray-200 px-1 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></li>
                  <li>Entrez votre mot de passe si demandé</li>
                  <li>Une fois l'installation terminée, démarrez Ollama avec : <code className="bg-gray-200 px-1 rounded">ollama serve</code></li>
                </ol>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://ollama.com/download', '_blank')}
              >
                Documentation complète
              </Button>
              <Button onClick={() => setInstallStep('test')}>
                J'ai installé Ollama
              </Button>
            </div>
          </div>
        )}
        
        {/* Étape de test */}
        {installStep === 'test' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Assurez-vous qu'Ollama est en cours d'exécution avant de continuer.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Vérifiez qu'Ollama est en cours d'exécution:</h4>
              
              {platform === 'windows' && (
                <p className="text-sm">
                  Vérifiez que l'icône d'Ollama est présente dans la barre des tâches (près de l'horloge). 
                  Si ce n'est pas le cas, lancez Ollama depuis le menu Démarrer.
                </p>
              )}
              
              {platform === 'mac' && (
                <p className="text-sm">
                  Vérifiez que l'icône d'Ollama est présente dans la barre de menu (en haut de l'écran).
                  Si ce n'est pas le cas, lancez Ollama depuis le dossier Applications.
                </p>
              )}
              
              {platform === 'linux' && (
                <p className="text-sm">
                  Si vous venez d'installer Ollama, ouvrez un terminal et exécutez :
                  <code className="block bg-gray-200 p-1 mt-1 rounded">ollama serve</code>
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleTestOllama} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                    Test en cours...
                  </>
                ) : (
                  <>Tester la connexion à Ollama</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Étape terminée */}
        {installStep === 'complete' && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Ollama est correctement installé et prêt à être utilisé !
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Informations sur Ollama:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Ollama est configuré pour fonctionner avec FileChat</li>
                <li>L'URL du service Ollama: <code className="bg-gray-200 px-1 rounded">http://localhost:11434</code></li>
                <li>Ollama doit rester en cours d'exécution pour que l'IA locale fonctionne</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                Continuer vers le téléchargement du modèle
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
