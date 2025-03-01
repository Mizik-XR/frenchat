
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSelector } from "./LocationSelector";
import { InstallationProgress } from "./InstallationProgress";

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

  const handleSelectLocation = (path: string) => {
    setSelectedPath(path);
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

          <TabsContent value="select">
            <LocationSelector 
              selectedPath={selectedPath} 
              onPathChange={setSelectedPath}
              onSelectLocation={handleSelectLocation}
            />
          </TabsContent>

          <TabsContent value="install">
            <InstallationProgress 
              installProgress={installProgress} 
              selectedPath={selectedPath} 
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          {currentTab === "select" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={simulateInstallation} className="gap-2">
                Installer
              </Button>
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
