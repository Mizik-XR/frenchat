
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pipeline } from "@huggingface/transformers";

const EMBEDDING_MODELS = [
  {
    id: "mxbai-embed-small",
    name: "MixedBread AI Small",
    description: "Modèle léger optimisé pour l'embarquement de texte",
    size: "85MB"
  },
  {
    id: "all-mpnet-base-v2",
    name: "MPNet Base",
    description: "Modèle équilibré pour l'indexation de documents",
    size: "420MB"
  }
];

const GENERATION_MODELS = [
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    description: "Modèle performant pour la génération de texte",
    size: "4.1GB"
  },
  {
    id: "phi-2",
    name: "Microsoft Phi-2",
    description: "Modèle compact avec de bonnes performances",
    size: "2.7GB"
  }
];

export function LocalAIConfig() {
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<string>("");
  const [selectedGenerationModel, setSelectedGenerationModel] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<{
    embedding: boolean;
    generation: boolean;
  }>({ embedding: false, generation: false });

  const handleModelDownload = async (modelId: string, type: 'embedding' | 'generation') => {
    setIsDownloading(true);
    try {
      if (type === 'embedding') {
        await pipeline('feature-extraction', modelId, {
          progress_callback: (progress) => {
            setDownloadProgress(Math.round(progress * 100));
          }
        });
        setModelStatus(prev => ({ ...prev, embedding: true }));
      } else {
        await pipeline('text-generation', modelId, {
          progress_callback: (progress) => {
            setDownloadProgress(Math.round(progress * 100));
          }
        });
        setModelStatus(prev => ({ ...prev, generation: true }));
      }

      toast({
        title: "Modèle téléchargé",
        description: "Le modèle a été téléchargé et configuré avec succès",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du modèle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le modèle",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les modèles sont téléchargés et exécutés localement dans votre navigateur.
          Assurez-vous d'avoir une connexion stable pour le téléchargement initial.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Configuration des Modèles</h3>
        
        <div className="space-y-6">
          {/* Modèle d'Embedding */}
          <div className="space-y-4">
            <h4 className="font-medium">Modèle d'Indexation</h4>
            <Select
              value={selectedEmbeddingModel}
              onValueChange={setSelectedEmbeddingModel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un modèle d'embedding" />
              </SelectTrigger>
              <SelectContent>
                {EMBEDDING_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-sm text-gray-500">
                        {model.description} ({model.size})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => handleModelDownload(selectedEmbeddingModel, 'embedding')}
              disabled={!selectedEmbeddingModel || isDownloading || modelStatus.embedding}
              className="w-full"
            >
              {modelStatus.embedding ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {modelStatus.embedding ? "Modèle Configuré" : "Télécharger le Modèle"}
            </Button>
          </div>

          {/* Modèle de Génération */}
          <div className="space-y-4">
            <h4 className="font-medium">Modèle de Génération</h4>
            <Select
              value={selectedGenerationModel}
              onValueChange={setSelectedGenerationModel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un modèle de génération" />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-sm text-gray-500">
                        {model.description} ({model.size})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => handleModelDownload(selectedGenerationModel, 'generation')}
              disabled={!selectedGenerationModel || isDownloading || modelStatus.generation}
              className="w-full"
            >
              {modelStatus.generation ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {modelStatus.generation ? "Modèle Configuré" : "Télécharger le Modèle"}
            </Button>
          </div>

          {isDownloading && (
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center mt-2">
                Téléchargement en cours : {downloadProgress}%
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
