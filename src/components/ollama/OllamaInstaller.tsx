
import { useState } from "react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Download, Server, AlertTriangle, ExternalLink } from "lucide-react";

interface OllamaInstallerProps {
  onComplete?: () => void;
}

export const OllamaInstaller = ({ onComplete }: OllamaInstallerProps) => {
  const { capabilities } = useSystemCapabilities();
  const [installStatus, setInstallStatus] = useState<'idle' | 'downloading' | 'installing' | 'completed' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState(capabilities.recommendedModels[0] || 'mistral');
  
  // URLs des téléchargements pour les différentes plateformes
  const downloadUrls = {
    windows: "https://ollama.com/download/windows",
    mac: "https://ollama.com/download/mac",
    linux: "https://ollama.com/download/linux"
  };
  
  // Détecter le système d'exploitation
  const getOs = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("windows") !== -1) return "windows";
    if (userAgent.indexOf("mac") !== -1) return "mac";
    if (userAgent.indexOf("linux") !== -1) return "linux";
    return "unknown";
  };
  
  const os = getOs();
  
  const handleDownload = () => {
    // Rediriger vers la page de téléchargement d'Ollama
    window.open(downloadUrls[os as keyof typeof downloadUrls] || "https://ollama.com/download", "_blank");
    
    // Simuler le processus d'installation (dans une vraie application, vous suivriez l'installation réelle)
    setInstallStatus('downloading');
    
    // Simulation du téléchargement
    const downloadInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(downloadInterval);
          setInstallStatus('installing');
          
          // Simulation de l'installation
          setTimeout(() => {
            setInstallStatus('completed');
            if (onComplete) onComplete();
          }, 3000);
          
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };
  
  const handleModelDownload = () => {
    // Dans une implémentation réelle, ce serait un appel API pour déclencher le téléchargement du modèle via Ollama
    // Ex: fetch('http://localhost:11434/api/pull', { method: 'POST', body: JSON.stringify({ name: selectedModel }) })
    alert(`Le modèle ${selectedModel} serait téléchargé ici. Dans une implémentation complète, cela appellerait l'API Ollama.`);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Installation d'Ollama
        </CardTitle>
        <CardDescription>
          Ollama vous permet d'exécuter des modèles d'IA localement sur votre ordinateur.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {installStatus === 'idle' && (
          <>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Détection du système</h3>
              <p className="text-sm text-blue-700">
                Système d'exploitation: <span className="font-medium">{os.charAt(0).toUpperCase() + os.slice(1)}</span>
              </p>
              <p className="text-sm text-blue-700">
                Mémoire RAM estimée: <span className="font-medium">{capabilities.memoryGB || 'Non détectée'} GB</span>
              </p>
              <p className="text-sm text-blue-700">
                Cœurs CPU: <span className="font-medium">{capabilities.cpuCores || 'Non détectés'}</span>
              </p>
              <p className="text-sm text-blue-700">
                GPU disponible: <span className="font-medium">{capabilities.gpuAvailable ? 'Oui' : 'Non'}</span>
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-1">Modèles recommandés pour votre machine</h3>
              <ul className="list-disc pl-5 text-sm text-green-700">
                {capabilities.recommendedModels.map(model => (
                  <li key={model}>{model}</li>
                ))}
              </ul>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                L'installation d'Ollama nécessite les droits d'administrateur sur votre ordinateur.
                Suivez les instructions après le téléchargement.
              </AlertDescription>
            </Alert>
          </>
        )}
        
        {(installStatus === 'downloading' || installStatus === 'installing') && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              {installStatus === 'downloading' ? 'Téléchargement en cours...' : 'Installation en cours...'}
            </h3>
            <Progress value={downloadProgress} className="h-2" />
            <p className="text-sm text-gray-500">
              {installStatus === 'downloading' 
                ? 'Veuillez attendre pendant le téléchargement...' 
                : 'Configuration d\'Ollama sur votre ordinateur...'}
            </p>
          </div>
        )}
        
        {installStatus === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <h3 className="font-medium">Installation terminée !</h3>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border">
              <h4 className="text-sm font-medium mb-2">Télécharger un modèle recommandé</h4>
              <div className="flex gap-2 mb-4">
                {capabilities.recommendedModels.map(model => (
                  <Button 
                    key={model} 
                    variant={selectedModel === model ? "default" : "outline"}
                    onClick={() => setSelectedModel(model)}
                    size="sm"
                  >
                    {model}
                  </Button>
                ))}
              </div>
              <Button onClick={handleModelDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Télécharger {selectedModel}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Une fois installé, vous pourrez utiliser les modèles Ollama directement depuis filechat.
            </div>
          </div>
        )}
        
        {installStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur d'installation</AlertTitle>
            <AlertDescription>
              Un problème est survenu lors de l'installation. Veuillez essayer de télécharger et installer Ollama manuellement.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {installStatus === 'idle' && (
          <>
            <Button variant="outline" onClick={() => window.open("https://ollama.com/", "_blank")}>
              En savoir plus
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger Ollama
            </Button>
          </>
        )}
        
        {installStatus === 'completed' && (
          <Button onClick={() => window.location.href = "/chat"} className="ml-auto">
            Commencer à utiliser l'IA locale
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
