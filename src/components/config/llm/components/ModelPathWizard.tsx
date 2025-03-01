
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, HardDrive, Check, DownloadCloud, HelpCircle, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModelPathWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPathSelected: (path: string) => void;
  defaultPath: string;
}

export function ModelPathWizard({ isOpen, onClose, onPathSelected, defaultPath }: ModelPathWizardProps) {
  const [selectedPath, setSelectedPath] = useState(defaultPath);
  const [currentTab, setCurrentTab] = useState("select");
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [commonLocations] = useState([
    { name: "Documents", path: "C:\\Users\\[utilisateur]\\Documents\\IA Models" },
    { name: "Programme Files", path: "C:\\Program Files\\FileChat\\Models" },
    { name: "Disque local", path: "D:\\IA Models" },
  ]);

  const handleManualPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPath(e.target.value);
  };

  const handleSelectLocation = (path: string) => {
    setSelectedPath(path);
  };

  const handleBrowseClick = () => {
    // Simuler un dialogue de sélection de dossier
    // Dans une application réelle, nous utiliserions l'API File System ou Electron
    alert("Dans une application native, le sélecteur de fichiers s'ouvrirait ici.");
  };

  const simulateInstallation = () => {
    setCurrentTab("install");
    setIsInstalling(true);
    setInstallProgress(0);
    
    // Simulation d'une installation progressive
    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsInstalling(false);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleFinish = () => {
    onPathSelected(selectedPath);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Assistant d'installation des modèles IA
          </DialogTitle>
          <DialogDescription>
            Configurez où les modèles d'IA seront stockés sur votre ordinateur.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="select" disabled={isInstalling}>
              Sélection du dossier
            </TabsTrigger>
            <TabsTrigger value="install" disabled={!isInstalling && installProgress === 0}>
              Installation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Emplacements recommandés</h3>
              <div className="grid gap-2">
                {commonLocations.map((location, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPath === location.path ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => handleSelectLocation(location.path)}
                  >
                    <HardDrive className="h-5 w-5 mr-3 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-gray-500">{location.path}</p>
                    </div>
                    {selectedPath === location.path && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h3 className="font-medium mb-2">Chemin personnalisé</h3>
                <div className="flex gap-2">
                  <Input
                    value={selectedPath}
                    onChange={handleManualPathChange}
                    placeholder="C:\Models"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleBrowseClick} className="gap-2">
                    <Folder className="h-4 w-4" />
                    Parcourir
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Assurez-vous d'avoir les droits d'écriture dans ce dossier.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
              <h4 className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Alternative recommandée
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Ollama est une solution plus simple qui gère automatiquement les modèles.
                Elle est recommandée pour la plupart des utilisateurs.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a 
                  href="https://ollama.ai/download" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  Télécharger Ollama
                  <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="install" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Installation des modèles IA</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{installProgress}%</span>
                </div>
                <Progress value={installProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Statut:</p>
                <div className="bg-gray-50 p-3 rounded-md border text-sm">
                  {installProgress < 30 && "Préparation de l'environnement..."}
                  {installProgress >= 30 && installProgress < 60 && "Téléchargement des fichiers modèles..."}
                  {installProgress >= 60 && installProgress < 90 && "Configuration des modèles..."}
                  {installProgress >= 90 && "Finalisation de l'installation..."}
                  {installProgress === 100 && "Installation terminée avec succès!"}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>Dossier d'installation: {selectedPath}</p>
                <p>Les modèles seront téléchargés automatiquement lors de la première utilisation.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          {currentTab === "select" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={simulateInstallation} className="gap-2">
                      <DownloadCloud className="h-4 w-4" />
                      Installer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Les modèles seront installés dans le dossier sélectionné
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isInstalling}>
                Annuler
              </Button>
              <Button 
                onClick={handleFinish} 
                disabled={isInstalling || installProgress < 100}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Terminer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
