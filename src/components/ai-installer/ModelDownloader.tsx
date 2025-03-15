
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SystemCapabilities } from "@/types/system";

interface ModelDownloaderProps {
  onComplete: () => void;
  capabilities?: SystemCapabilities;
  addLogMessage: (message: string) => void;
}

export function ModelDownloader({ onComplete, capabilities, addLogMessage }: ModelDownloaderProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  // Déterminer les modèles recommandés en fonction des capacités système
  const getRecommendedModels = () => {
    if (!capabilities) {
      return [
        { id: 'mistral:7b', name: 'Mistral 7B', description: 'Modèle polyvalent', size: '4 Go' }
      ];
    }
    
    const models = [];
    
    if (capabilities.hasGpu && capabilities.memoryInGB && capabilities.memoryInGB >= 16) {
      models.push({ 
        id: 'mixtral:8x7b', 
        name: 'Mixtral 8x7B', 
        description: 'Modèle haute performance, excellent pour les tâches complexes', 
        size: '26 Go'
      });
    }
    
    if (capabilities.memoryInGB && capabilities.memoryInGB >= 8) {
      models.push({ 
        id: 'mistral:7b', 
        name: 'Mistral 7B', 
        description: 'Modèle polyvalent, bon équilibre performances/ressources', 
        size: '4 Go'
      });
    }
    
    models.push({ 
      id: 'mistral:7b-instruct-q4_0', 
      name: 'Mistral 7B (quantifié 4-bit)', 
      description: 'Version légère, consommation réduite de mémoire', 
      size: '2 Go'
    });
    
    return models;
  };
  
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    addLogMessage(`📋 Modèle sélectionné: ${modelId}`);
  };
  
  const startDownload = () => {
    if (!selectedModel) {
      toast({
        title: "Aucun modèle sélectionné",
        description: "Veuillez sélectionner un modèle à télécharger",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    addLogMessage(`📥 Début du téléchargement du modèle ${selectedModel}`);
    
    // Simuler le téléchargement
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          finishDownload();
          return 100;
        }
        if (prev >= 95) {
          return prev + 1;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
  };
  
  const finishDownload = () => {
    addLogMessage(`✅ Téléchargement et installation du modèle terminés`);
    
    // Enregistrer le modèle par défaut
    const modelId = selectedModel || 'mistral:7b';
    localStorage.setItem('defaultModel', modelId);
    localStorage.setItem('modelInstallDate', new Date().toISOString());
    
    toast({
      title: "Modèle installé",
      description: "Le modèle a été téléchargé et configuré avec succès",
    });
    
    // Continuer au prochain étape
    setTimeout(() => {
      onComplete();
    }, 1000);
  };
  
  const recommendedModels = getRecommendedModels();
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Téléchargement du modèle IA</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-2">
            Sélectionnez un modèle adapté à votre configuration matérielle :
          </div>
          
          <div className="grid gap-4">
            {recommendedModels.map((model) => (
              <div 
                key={model.id}
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  selectedModel === model.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">{model.size}</div>
                </div>
              </div>
            ))}
          </div>
          
          {isDownloading ? (
            <div className="space-y-2">
              <Progress value={downloadProgress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                Téléchargement... {Math.round(downloadProgress)}%
              </p>
            </div>
          ) : (
            <div className="pt-4 flex justify-end">
              <Button 
                onClick={startDownload} 
                disabled={!selectedModel} 
                className="gap-2"
              >
                Télécharger et installer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
