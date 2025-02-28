
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ExternalLink, Server, Cpu, Globe } from "lucide-react";

interface CompanionDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanionDownloadDialog({ open, onOpenChange }: CompanionDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Options pour exécuter l'IA</DialogTitle>
          <DialogDescription>
            Choisissez la méthode qui convient le mieux à vos besoins
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browser">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="browser" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span>Navigateur</span>
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span>Serveur Local</span>
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>Cloud</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browser" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Exécution dans le navigateur</h3>
              <p className="text-sm text-gray-600 mb-4">
                La méthode la plus simple - aucune installation requise. Les modèles s'exécutent directement 
                dans votre navigateur grâce à WebGPU.
              </p>
              
              <div className="text-sm space-y-1 mb-4">
                <p className="font-medium">Prérequis :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Navigateur moderne (Chrome, Edge ou Firefox récent)</li>
                  <li>Carte graphique relativement récente</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex gap-2" asChild>
                  <a 
                    href="https://developer.chrome.com/docs/web-platform/webgpu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Plus d'informations sur WebGPU
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="local" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Serveur IA Local</h3>
              <p className="text-sm text-gray-600 mb-4">
                Exécutez des modèles plus grands et plus performants sur votre machine avec plus de contrôle.
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <img src="https://ollama.com/public/ollama.png" alt="Ollama" className="h-4 w-4" />
                    Ollama (Recommandé)
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Solution simple pour exécuter des modèles localement sur Windows, Mac ou Linux.
                  </p>
                  <Button variant="default" className="flex gap-2" asChild>
                    <a 
                      href="https://ollama.com/download" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                      Télécharger Ollama
                    </a>
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Script Python (utilisateurs avancés)</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Exécutez directement le script Python inclus avec FileChat pour plus de contrôle.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="flex gap-2" asChild>
                      <a 
                        href="https://github.com/filechat-app/filechat-server/releases/latest" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        Télécharger (Windows)
                      </a>
                    </Button>
                    <Button variant="outline" className="flex gap-2" asChild>
                      <a 
                        href="https://github.com/filechat-app/filechat-server/releases/latest" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        Télécharger (Mac/Linux)
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cloud" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Cloud</h3>
              <p className="text-sm text-gray-600 mb-4">
                Aucune installation requise. Les modèles s'exécutent sur nos serveurs cloud.
              </p>
              
              <div className="text-sm space-y-1 mb-4">
                <p className="font-medium">Avantages :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Aucune configuration nécessaire</li>
                  <li>Performances constantes quel que soit votre appareil</li>
                  <li>Accès aux modèles les plus récents</li>
                </ul>
              </div>
              
              <div className="text-sm space-y-1 mb-4">
                <p className="font-medium">Considérations :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nécessite une connexion Internet</li>
                  <li>Les données transitent par nos serveurs</li>
                </ul>
              </div>
              
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Utiliser le service cloud
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
