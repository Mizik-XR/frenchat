
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Monitor, Apple, Award, Database, Server, ExternalLink, Download, Check, Rocket } from "lucide-react";
import { useHuggingFace } from "@/hooks/useHuggingFace";

interface CompanionDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanionDownloadDialog({
  open,
  onOpenChange,
}: CompanionDownloadDialogProps) {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  const [ollamaChecking, setOllamaChecking] = useState(false);
  const { checkLocalService } = useHuggingFace();

  const handleDownload = (platform: string, url: string) => {
    // Déclencher le téléchargement
    window.open(url, "_blank");
    // Mettre à jour l'état
    setDownloadStarted(platform);
    // Réinitialiser après 3 secondes
    setTimeout(() => setDownloadStarted(null), 3000);
  };

  const checkOllamaStatus = async () => {
    setOllamaChecking(true);
    try {
      const isAvailable = await checkLocalService('http://localhost:11434');
      if (isAvailable) {
        // Ollama est disponible, configurer l'application
        localStorage.setItem('localProvider', 'ollama');
        localStorage.setItem('localAIUrl', 'http://localhost:11434');
        localStorage.setItem('aiServiceType', 'local');
        
        // Notifier l'utilisateur
        alert("Ollama est détecté et configuré avec succès! L'application utilisera maintenant Ollama pour l'IA locale.");
      } else {
        alert("Ollama n'est pas détecté. Assurez-vous qu'il est installé et en cours d'exécution.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification d'Ollama:", error);
      alert("Impossible de vérifier le statut d'Ollama. Vérifiez que vous l'avez bien installé.");
    } finally {
      setOllamaChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Utiliser l'IA locale avec FileChat
            <Badge variant="secondary" className="ml-2">
              RECOMMANDÉ
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choisissez entre des options simples (Ollama) ou avancées (FileChat Companion) pour utiliser l'IA localement
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ollama" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ollama">Ollama (Simple)</TabsTrigger>
            <TabsTrigger value="download">Compagnon FileChat</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ollama" className="py-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Solution recommandée: Ollama
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Ollama est la solution la plus simple pour exécuter des modèles d'IA localement.
                Elle est facile à installer et ne nécessite aucune compétence technique.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="h-32 flex flex-col justify-center items-center gap-2"
                  onClick={() => handleDownload("ollama-windows", "https://ollama.ai/download/windows")}
                >
                  <Monitor className="h-8 w-8" />
                  <span>Windows</span>
                  <span className="text-xs opacity-75">Ollama pour Windows</span>
                </Button>
                <Button 
                  className="h-32 flex flex-col justify-center items-center gap-2"
                  onClick={() => handleDownload("ollama-mac", "https://ollama.ai/download/mac")}
                >
                  <Apple className="h-8 w-8" />
                  <span>macOS</span>
                  <span className="text-xs opacity-75">Ollama pour Mac</span>
                </Button>
              </div>
              
              <Button 
                className="mt-2"
                variant="outline"
                onClick={checkOllamaStatus}
                disabled={ollamaChecking}
              >
                {ollamaChecking ? "Vérification..." : "Vérifier l'installation d'Ollama"}
              </Button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                <p>Après l'installation d'Ollama:</p>
                <ol className="list-decimal text-left ml-5 mt-2">
                  <li>Lancez Ollama</li>
                  <li>Cliquez sur "Vérifier l'installation" ci-dessus</li>
                  <li>FileChat se configurera automatiquement pour utiliser Ollama</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="download" className="py-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-100 dark:border-amber-900 mb-4">
              <h3 className="font-medium text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Server className="h-5 w-5" />
                Solution avancée
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Le Compagnon FileChat est une solution plus avancée qui nécessite Python.
                Recommandé pour les utilisateurs techniques ou les cas d'usage spécifiques.
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                className={`w-44 h-32 flex flex-col justify-center items-center gap-2 ${downloadStarted === "windows" ? "bg-green-600" : ""}`}
                onClick={() => handleDownload("windows", "https://github.com/filechat-ai/filechat-companion/releases/latest/download/filechat-companion-windows.exe")}
              >
                {downloadStarted === "windows" ? (
                  <>
                    <Check className="h-8 w-8" />
                    <span>Téléchargement lancé</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-8 w-8" />
                    <span>Windows</span>
                    <span className="text-xs opacity-75">Version 1.2.0</span>
                    <Download className="h-4 w-4 mt-1" />
                  </>
                )}
              </Button>
              <Button 
                className={`w-44 h-32 flex flex-col justify-center items-center gap-2 ${downloadStarted === "macos" ? "bg-green-600" : ""}`}
                onClick={() => handleDownload("macos", "https://github.com/filechat-ai/filechat-companion/releases/latest/download/filechat-companion-macos.dmg")}
              >
                {downloadStarted === "macos" ? (
                  <>
                    <Check className="h-8 w-8" />
                    <span>Téléchargement lancé</span>
                  </>
                ) : (
                  <>
                    <Apple className="h-8 w-8" />
                    <span>macOS</span>
                    <span className="text-xs opacity-75">Version 1.2.0</span>
                    <Download className="h-4 w-4 mt-1" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="models" className="py-4">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Modèles recommandés</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="font-medium">Mistral 7B</span>
                    <Badge variant="secondary">8 Go RAM min</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Llama 2</span>
                    <Badge variant="secondary">16 Go RAM min</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Phi-2</span>
                    <Badge variant="secondary">4 Go RAM min</Badge>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Le Compagnon FileChat IA utilise par défaut Mistral 7B, un modèle offrant un bon 
                  équilibre entre performance et ressources requises. Pour Ollama, vous pouvez télécharger 
                  différents modèles selon vos besoins avec la commande:
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-2 overflow-x-auto">
                  ollama pull mistral         # Modèle recommandé
                  ollama pull llama2          # Alternative puissante
                  ollama pull phi             # Pour systèmes légers
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="instructions" className="py-4">
            <div className="space-y-6 text-sm">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-lg">Option 1: Ollama (recommandée)</h3>
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">1. Installez Ollama</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Téléchargez et installez <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ollama</a> depuis le site officiel.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">2. Lancez Ollama</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Ouvrez simplement l'application Ollama qui s'exécutera en arrière-plan.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">3. Configurez FileChat</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Cliquez sur "Vérifier l'installation d'Ollama" dans l'onglet Ollama pour configurer automatiquement FileChat.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 space-y-4 mt-4">
                <h3 className="font-medium text-lg">Option 2: Compagnon FileChat (avancé)</h3>
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">1. Installez le Compagnon</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Téléchargez et installez le Compagnon FileChat correspondant à votre système d'exploitation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">2. Démarrez le service</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Lancez le Compagnon FileChat. Le service démarrera automatiquement et se mettra en 
                      attente de connexions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">3. Configurez FileChat</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Dans les paramètres de FileChat, sélectionnez "IA Locale" et vérifiez que l'URL est configurée sur http://localhost:8000.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-100 dark:border-blue-900 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Le modèle sera automatiquement téléchargé lors de la première utilisation. Selon votre connexion, 
                  cette opération peut prendre plusieurs minutes.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
          <a 
            href="https://github.com/filechat-ai/filechat-companion" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="default">
              Documentation complète
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
