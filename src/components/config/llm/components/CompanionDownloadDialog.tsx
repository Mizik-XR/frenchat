
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Download, ExternalLink, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanionDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanionDownloadDialog({
  open,
  onOpenChange,
}: CompanionDownloadDialogProps) {
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "completed" | "error">("idle");
  const [activeTab, setActiveTab] = useState("windows");

  const handleDownload = () => {
    setDownloadStatus("downloading");
    
    // Simuler un téléchargement
    setTimeout(() => {
      setDownloadStatus("completed");
    }, 2000);
  };
  
  const getDownloadLink = () => {
    switch(activeTab) {
      case "windows":
        return "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.msi";
      case "mac":
        return "https://github.com/ollama/ollama/releases/latest/download/ollama-darwin";
      case "linux":
        return "https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64";
      default:
        return "#";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Télécharger le Compagnon IA</DialogTitle>
          <DialogDescription>
            Installez l'IA localement sur votre ordinateur pour une expérience plus rapide et privée
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="windows" className="w-full mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="mac">macOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          
          <TabsContent value="windows" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <h3 className="font-medium">Installation sur Windows</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Téléchargez le programme d'installation Ollama</li>
                <li>Exécutez le fichier .msi téléchargé</li>
                <li>Suivez les instructions d'installation</li>
                <li>Une fois installé, redémarrez FileChat</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="mac" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <h3 className="font-medium">Installation sur macOS</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Téléchargez Ollama pour macOS</li>
                <li>Ouvrez le Terminal</li>
                <li>Exécutez: <code className="bg-gray-200 px-1 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></li>
                <li>Une fois installé, redémarrez FileChat</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="linux" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <h3 className="font-medium">Installation sur Linux</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Ouvrez un terminal</li>
                <li>Exécutez: <code className="bg-gray-200 px-1 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></li>
                <li>Démarrez le service: <code className="bg-gray-200 px-1 rounded">ollama serve</code></li>
                <li>Une fois installé, redémarrez FileChat</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
          <h4 className="font-medium text-blue-800 mb-2">Après l'installation</h4>
          <p className="text-sm text-gray-700">
            Une fois installé, vous pourrez utiliser des modèles Ollama directement dans FileChat.
            Configurez Ollama comme votre fournisseur d'IA local pour commencer.
          </p>
          <div className="flex mt-3">
            <a 
              href="https://ollama.com/library" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mr-4"
            >
              Modèles disponibles
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
            <a 
              href="https://github.com/ollama/ollama" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Documentation
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <a 
            href={getDownloadLink()}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2" onClick={handleDownload}>
              {downloadStatus === "downloading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : downloadStatus === "completed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloadStatus === "downloading" 
                ? "Téléchargement..." 
                : downloadStatus === "completed" 
                  ? "Téléchargé" 
                  : "Télécharger"
              }
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
