
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SystemCapabilities } from "@/types/system";
import { getPlatform, getOllamaInstallCommand } from "@/utils/platformUtils";

interface OllamaInstallerProps {
  onComplete: () => void;
  capabilities?: SystemCapabilities;
  addLogMessage: (message: string) => void;
}

export function OllamaInstaller({ onComplete, capabilities, addLogMessage }: OllamaInstallerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [ollamaInstalled, setOllamaInstalled] = useState(false);
  const { toast } = useToast();
  
  const platform = getPlatform();
  const installCommand = getOllamaInstallCommand() || "";
  
  const checkOllamaInstallation = () => {
    setIsChecking(true);
    addLogMessage("🔍 Vérification de l'installation d'Ollama...");
    
    // Simuler une vérification
    setTimeout(() => {
      // Vérifier si ollama est déjà installé
      const isInstalled = localStorage.getItem('ollamaInstalled') === 'true';
      
      if (isInstalled) {
        setOllamaInstalled(true);
        addLogMessage("✅ Ollama est déjà installé sur votre système");
        toast({
          title: "Ollama détecté",
          description: "Ollama est déjà installé sur votre système.",
        });
      } else {
        addLogMessage("ℹ️ Ollama n'est pas installé ou n'a pas été détecté");
      }
      
      setIsChecking(false);
    }, 1500);
  };
  
  const installOllama = () => {
    setIsInstalling(true);
    setInstallProgress(0);
    addLogMessage(`🚀 Début de l'installation d'Ollama pour ${platform}`);
    addLogMessage(`📋 Commande: ${installCommand}`);
    
    // Simuler l'installation
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishInstallation();
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
  };
  
  const finishInstallation = () => {
    setIsInstalling(false);
    setOllamaInstalled(true);
    localStorage.setItem('ollamaInstalled', 'true');
    localStorage.setItem('localProvider', 'ollama');
    localStorage.setItem('localAIUrl', 'http://localhost:11434');
    addLogMessage("✅ Installation d'Ollama terminée avec succès");
    
    toast({
      title: "Installation réussie",
      description: "Ollama a été installé et configuré avec succès.",
    });
    
    // Continuer après un court délai
    setTimeout(() => {
      onComplete();
    }, 1000);
  };
  
  // Vérifier si Ollama est installé au chargement du composant
  useState(() => {
    checkOllamaInstallation();
  });
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Installation d'Ollama</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1.5 mt-0.5">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Moteur IA local Ollama</p>
              <p className="text-sm text-gray-600">
                Ollama permet d'exécuter des modèles d'IA localement sur votre ordinateur, 
                sans envoyer vos données à des services externes.
              </p>
            </div>
          </div>
          
          {ollamaInstalled ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Ollama est installé</p>
                <p className="text-sm text-green-700">
                  Le moteur d'IA local est prêt à l'emploi sur votre système.
                </p>
              </div>
            </div>
          ) : isInstalling ? (
            <div className="space-y-2">
              <Progress value={installProgress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                Installation en cours... {Math.round(installProgress)}%
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
                <p className="text-sm text-amber-800">
                  Ollama n'est pas installé ou n'a pas été détecté sur votre système.
                  L'installation est nécessaire pour exécuter l'IA localement.
                </p>
              </div>
              
              <div className="bg-gray-50 border rounded-md p-4">
                <p className="text-sm font-medium mb-1">Commande d'installation :</p>
                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                  {installCommand}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={checkOllamaInstallation} 
                  disabled={isChecking || isInstalling}
                >
                  {isChecking ? 'Vérification...' : 'Vérifier à nouveau'}
                </Button>
                <Button 
                  onClick={installOllama} 
                  disabled={isChecking || isInstalling}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Installer Ollama
                </Button>
              </div>
            </div>
          )}
          
          {ollamaInstalled && (
            <div className="pt-2 flex justify-end">
              <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                Continuer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
