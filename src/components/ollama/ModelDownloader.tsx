
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Cpu, DownloadCloud, CheckCircle2, AlertCircle, HardDrive, MemoryStick, Zap } from "lucide-react";
import { getOllamaModels } from "@/hooks/ai/ollamaService";

interface SystemCapabilities {
  memoryGB?: number;
  cpuCores?: number;
  gpuAvailable?: boolean;
  recommendedModels: string[];
}

interface ModelDownloaderProps {
  systemCapabilities: SystemCapabilities;
}

export const ModelDownloader = ({ systemCapabilities }: ModelDownloaderProps) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>("mistral");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [installedModels, setInstalledModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modèles disponibles avec leurs caractéristiques
  const availableModels = [
    {
      id: "mistral",
      name: "Mistral 7B",
      description: "Modèle équilibré pour la plupart des usages",
      memoryRequired: 8,
      diskSpace: "4.1 GB",
      speed: "Rapide",
      tags: ["Polyvalent", "Français", "Raisonnement"]
    },
    {
      id: "llama2",
      name: "Llama 2",
      description: "Modèle Meta AI pour conversations générales",
      memoryRequired: 8,
      diskSpace: "3.8 GB",
      speed: "Moyen",
      tags: ["Conversation", "Anglais", "Créativité"]
    },
    {
      id: "phi",
      name: "Phi-3 Mini",
      description: "Petit modèle Microsoft très efficace",
      memoryRequired: 4,
      diskSpace: "1.8 GB",
      speed: "Très rapide",
      tags: ["Léger", "Performant", "Anglais"]
    },
    {
      id: "codellama",
      name: "Code Llama",
      description: "Spécialisé pour le code et la programmation",
      memoryRequired: 10,
      diskSpace: "7.2 GB",
      speed: "Moyen",
      tags: ["Code", "Programmation", "Technique"]
    },
    {
      id: "nous-hermes",
      name: "Nous Hermes",
      description: "Optimisé pour les questions complexes",
      memoryRequired: 16,
      diskSpace: "13.4 GB",
      speed: "Lent",
      tags: ["Précision", "Connaissances", "Raisonnement"]
    }
  ];
  
  // Filtrer les modèles recommandés basé sur le hardware
  const getRecommendedModels = () => {
    if (!systemCapabilities.memoryGB) return availableModels.slice(0, 2);
    
    return availableModels.filter(model => {
      // Laisser une marge pour le système d'exploitation et autres applications
      const availableMemory = (systemCapabilities.memoryGB || 0) - 4;
      return model.memoryRequired <= availableMemory;
    });
  };
  
  const recommendedModels = getRecommendedModels();
  
  // Récupérer les modèles installés depuis Ollama
  useEffect(() => {
    const fetchInstalledModels = async () => {
      try {
        const models = await getOllamaModels('http://localhost:11434');
        setInstalledModels(models);
      } catch (error) {
        console.error("Erreur lors de la récupération des modèles Ollama:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstalledModels();
  }, []);
  
  const isModelInstalled = (modelId: string) => {
    return installedModels.some(model => model.name === modelId);
  };
  
  const handleDownloadModel = (modelId: string) => {
    setSelectedModel(modelId);
    setDownloadState('downloading');
    setDownloadProgress(0);
    
    // Simuler le téléchargement pour la démo
    // Dans une implémentation réelle, utilisez l'API Ollama
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadState('completed');
          toast({
            title: "Téléchargement terminé",
            description: `Le modèle ${modelId} a été téléchargé avec succès.`,
          });
          return 100;
        }
        return prev + 2;
      });
    }, 300);
  };
  
  const handleCancelDownload = () => {
    setDownloadState('idle');
    setDownloadProgress(0);
    toast({
      title: "Téléchargement annulé",
      description: "Le téléchargement du modèle a été annulé.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Cpu className="h-6 w-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Configuration matérielle détectée</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="flex items-center gap-2 text-gray-600">
                <MemoryStick className="h-4 w-4 text-blue-500" />
                <span>Mémoire RAM: {systemCapabilities.memoryGB || "Non détectée"} GB</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span>Processeur: {systemCapabilities.cpuCores || "Non détecté"} cœurs</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>GPU: {systemCapabilities.gpuAvailable ? "Disponible" : "Non détecté"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recommended">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="recommended">Recommandés</TabsTrigger>
          <TabsTrigger value="all">Tous les modèles</TabsTrigger>
          <TabsTrigger value="installed">Installés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedModels.map(model => (
              <ModelCard 
                key={model.id}
                model={model}
                isInstalled={isModelInstalled(model.id)}
                isDownloading={downloadState === 'downloading' && selectedModel === model.id}
                downloadProgress={downloadProgress}
                onDownload={() => handleDownloadModel(model.id)}
                onCancel={handleCancelDownload}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModels.map(model => (
              <ModelCard 
                key={model.id}
                model={model}
                isInstalled={isModelInstalled(model.id)}
                isDownloading={downloadState === 'downloading' && selectedModel === model.id}
                downloadProgress={downloadProgress}
                onDownload={() => handleDownloadModel(model.id)}
                onCancel={handleCancelDownload}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="installed" className="space-y-4">
          {isLoading ? (
            <div className="text-center p-8">
              <p>Chargement des modèles installés...</p>
            </div>
          ) : installedModels.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun modèle installé</h3>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore installé de modèles Ollama.
                Sélectionnez un modèle recommandé pour commencer.
              </p>
              <Button onClick={() => document.querySelector('[data-value="recommended"]')?.click()}>
                Voir les modèles recommandés
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {installedModels.map(model => (
                <div key={model.name} className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          <span>{(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                        </div>
                        <div>Installé le: {new Date(model.modified).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="p-4 bg-gray-50 rounded-lg border mt-6">
        <h3 className="font-medium mb-2">Information sur l'utilisation des modèles</h3>
        <p className="text-sm text-gray-600 mb-3">
          Les modèles sont téléchargés et exécutés localement sur votre ordinateur. 
          Aucune donnée n'est envoyée à des serveurs externes lors de l'utilisation des modèles Ollama.
        </p>
        <div className="text-xs text-gray-500">
          Une connexion internet est requise uniquement pour le téléchargement initial des modèles.
        </div>
      </div>
    </div>
  );
};

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    description: string;
    memoryRequired: number;
    diskSpace: string;
    speed: string;
    tags: string[];
  };
  isInstalled: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: () => void;
  onCancel: () => void;
}

const ModelCard = ({ 
  model, 
  isInstalled, 
  isDownloading,
  downloadProgress,
  onDownload,
  onCancel 
}: ModelCardProps) => {
  return (
    <Card className={`transition-all duration-200 ${isInstalled ? 'border-green-300 bg-green-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <CardDescription>{model.description}</CardDescription>
          </div>
          {isInstalled && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Installé
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">RAM requise</span>
            <span className="font-medium">{model.memoryRequired} GB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Espace disque</span>
            <span className="font-medium">{model.diskSpace}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Vitesse</span>
            <span className="font-medium">{model.speed}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {model.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        {isDownloading && (
          <div className="mt-3 mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Téléchargement en cours...</span>
              <span>{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isInstalled ? (
          <Button variant="outline" className="w-full" disabled>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Déjà installé
          </Button>
        ) : isDownloading ? (
          <Button variant="destructive" className="w-full" onClick={onCancel}>
            Annuler
          </Button>
        ) : (
          <Button className="w-full" onClick={onDownload}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
