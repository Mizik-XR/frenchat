
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelList from "./components/ModelList";
import { SystemCapabilities } from "@/hooks/useSystemCapabilities";
import { safeButtonClick } from "./utils/modelUtils";

interface ModelDownloaderProps {
  systemCapabilities: SystemCapabilities;
}

const ModelDownloader = ({ systemCapabilities }: ModelDownloaderProps) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  
  const downloadModel = (modelId: string) => {
    setDownloadingModel(modelId);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setInstalledModels(prev => [...prev, modelId]);
          setDownloadingModel(null);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Modèles d'IA pour Ollama</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="recommended">Recommandés</TabsTrigger>
            <TabsTrigger value="specialized">Spécialisés</TabsTrigger>
            <TabsTrigger value="experimental">Expérimentaux</TabsTrigger>
            <TabsTrigger value="all">Tous</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <ModelList
              activeTab={activeTab}
              systemCapabilities={systemCapabilities}
              installedModels={installedModels}
              downloadingModel={downloadingModel}
              downloadProgress={progress}
              onDownload={downloadModel}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          {installedModels.length} modèle(s) installé(s)
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("https://ollama.com/library", "_blank")}
        >
          Voir tous les modèles
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelDownloader;
