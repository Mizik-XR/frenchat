
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CheckCircle, AlertTriangle } from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  category: 'recommended' | 'specialized' | 'experimental';
  tags: string[];
  requirements: {
    memory: string;
    disk: string;
    gpu?: boolean;
  };
}

interface ModelDownloaderProps {
  systemCapabilities: {
    isHighEndSystem: boolean;
    isMidEndSystem: boolean;
    isLowEndSystem: boolean;
    gpuAvailable: boolean;
  };
}

export const ModelDownloader = ({ systemCapabilities }: ModelDownloaderProps) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  
  // Liste des modèles adaptés à différentes configurations
  const models: ModelInfo[] = [
    {
      id: 'llama3-8b',
      name: 'Llama 3 (8B)',
      description: 'Modèle polyvalent de Meta, bon équilibre entre taille et performance',
      size: '4.8 GB',
      category: 'recommended',
      tags: ['général', 'chat', 'complet'],
      requirements: {
        memory: '8 GB',
        disk: '10 GB'
      }
    },
    {
      id: 'mistral-7b',
      name: 'Mistral (7B)',
      description: 'Excellent pour les tâches générales et le traitement de texte',
      size: '4.1 GB',
      category: 'recommended',
      tags: ['général', 'texte', 'efficace'],
      requirements: {
        memory: '6 GB',
        disk: '8 GB'
      }
    },
    {
      id: 'phi-2',
      name: 'Phi-2',
      description: 'Modèle compact de Microsoft avec d\'excellentes performances',
      size: '1.7 GB',
      category: 'recommended',
      tags: ['léger', 'rapide', 'efficace'],
      requirements: {
        memory: '4 GB',
        disk: '5 GB'
      }
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      description: 'Spécialisé pour le code et la programmation',
      size: '3.8 GB',
      category: 'specialized',
      tags: ['code', 'programmation', 'développement'],
      requirements: {
        memory: '8 GB',
        disk: '8 GB'
      }
    },
    {
      id: 'gemma-2b',
      name: 'Gemma (2B)',
      description: 'Modèle très léger de Google, idéal pour les systèmes limités',
      size: '1.2 GB',
      category: 'recommended',
      tags: ['très léger', 'rapide', 'limité'],
      requirements: {
        memory: '2 GB',
        disk: '3 GB'
      }
    },
    {
      id: 'llama3-70b',
      name: 'Llama 3 (70B)',
      description: 'Version large du modèle Llama, très performante',
      size: '39 GB',
      category: 'experimental',
      tags: ['avancé', 'haute performance', 'lourd'],
      requirements: {
        memory: '32 GB',
        disk: '80 GB',
        gpu: true
      }
    }
  ];
  
  // Filtrer les modèles en fonction des capacités du système
  const getFilteredModels = () => {
    if (systemCapabilities.isHighEndSystem) {
      return models;
    } else if (systemCapabilities.isMidEndSystem) {
      return models.filter(m => !m.requirements.gpu && 
        parseInt(m.requirements.memory.split(' ')[0]) <= 8);
    } else {
      return models.filter(m => !m.requirements.gpu && 
        parseInt(m.requirements.memory.split(' ')[0]) <= 4);
    }
  };
  
  const filteredModels = getFilteredModels();
  
  // Filtrer par catégorie et onglet actif
  const displayedModels = filteredModels.filter(m => 
    activeTab === 'all' || m.category === activeTab
  );
  
  const downloadModel = (modelId: string) => {
    setDownloadingModel(modelId);
    setProgress(0);
    
    // Simuler le téléchargement
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
  
  const isModelCompatible = (model: ModelInfo) => {
    if (model.requirements.gpu && !systemCapabilities.gpuAvailable) {
      return false;
    }
    
    if (systemCapabilities.isLowEndSystem && 
      parseInt(model.requirements.memory.split(' ')[0]) > 4) {
      return false;
    }
    
    return true;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedModels.map(model => (
                <div 
                  key={model.id}
                  className={`border rounded-lg p-4 ${!isModelCompatible(model) ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{model.name}</h3>
                    <div className="text-sm text-gray-500">{model.size}</div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {model.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      RAM: {model.requirements.memory} | Disque: {model.requirements.disk}
                      {model.requirements.gpu && " | GPU requis"}
                    </div>
                    
                    {installedModels.includes(model.id) ? (
                      <Button variant="outline" size="sm" disabled className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Installé
                      </Button>
                    ) : downloadingModel === model.id ? (
                      <div className="w-32">
                        <Progress value={progress} className="h-2 mb-1" />
                        <div className="text-xs text-center">{progress}%</div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => downloadModel(model.id)}
                        disabled={!isModelCompatible(model)}
                        className="gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Installer
                      </Button>
                    )}
                  </div>
                  
                  {!isModelCompatible(model) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Non compatible avec votre système
                    </div>
                  )}
                </div>
              ))}
            </div>
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
