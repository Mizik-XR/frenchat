
import React from "react";
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
import { Windows, Apple, Award, Database, Server, ExternalLink } from "lucide-react";

interface CompanionDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanionDownloadDialog({
  open,
  onOpenChange,
}: CompanionDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Télécharger le Compagnon FileChat IA
            <Badge variant="secondary" className="ml-2">
              RECOMMANDÉ
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Le Compagnon IA améliore les performances et permet d'utiliser des modèles d'IA localement
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="download" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">Téléchargement</TabsTrigger>
            <TabsTrigger value="models">Modèles supportés</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="download" className="py-4 space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/filechat-ai/filechat-companion/releases/latest/download/filechat-companion-windows.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-44 h-32 flex flex-col justify-center items-center gap-2">
                    <Windows className="h-8 w-8" />
                    <span>Windows</span>
                    <span className="text-xs opacity-75">Version 1.2.0</span>
                  </Button>
                </a>
                <a
                  href="https://github.com/filechat-ai/filechat-companion/releases/latest/download/filechat-companion-macos.dmg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-44 h-32 flex flex-col justify-center items-center gap-2">
                    <Apple className="h-8 w-8" />
                    <span>macOS</span>
                    <span className="text-xs opacity-75">Version 1.2.0</span>
                  </Button>
                </a>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ou utilisez{" "}
                <a
                  href="https://ollama.ai/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Ollama
                </a>{" "}
                pour une installation simplifiée sur toutes les plateformes
              </div>
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
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">1. Installez le Compagnon</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Téléchargez et installez le Compagnon FileChat correspondant à votre système d'exploitation, 
                    ou installez Ollama si vous préférez cette option.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Server className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">2. Démarrez le service</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Lancez le Compagnon FileChat ou Ollama. Le service démarrera automatiquement et se mettra en 
                    attente de connexions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">3. Configurez FileChat</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Dans les paramètres de FileChat, sélectionnez "IA Locale" et choisissez le 
                    fournisseur approprié (Hugging Face ou Ollama) selon votre installation.
                  </p>
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
