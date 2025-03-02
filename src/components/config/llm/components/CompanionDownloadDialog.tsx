
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModelDownload } from "@/hooks/useModelDownload";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ModelDownloadStatus } from "@/hooks/ai/types";
import { checkOllamaInstalled, downloadOllamaModel } from "@/utils/ollamaSetup";

interface CompanionDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string;
  modelName: string;
  onSuccess?: () => void;
}

export function CompanionDownloadDialog({
  open,
  onOpenChange,
  modelId,
  modelName,
  onSuccess
}: CompanionDownloadDialogProps) {
  const { downloadStatus, startModelDownload, fetchDownloadProgress } = useModelDownload();
  const [isInitiating, setIsInitiating] = useState(false);
  const [useOllama, setUseOllama] = useState(false);
  
  // Au chargement, vérifier si Ollama est disponible
  useEffect(() => {
    if (open) {
      checkOllamaInstalled().then(available => {
        setUseOllama(available);
      });
      
      // Vérifier l'état actuel du téléchargement
      fetchDownloadProgress();
    }
  }, [open, fetchDownloadProgress]);
  
  const handleStartDownload = async () => {
    setIsInitiating(true);
    
    try {
      if (useOllama) {
        // Utiliser Ollama pour le téléchargement
        const ollamaModelName = modelId.includes('/') 
          ? modelId.split('/').pop() || 'mistral' 
          : 'mistral';
        
        const result = await downloadOllamaModel(ollamaModelName.toLowerCase());
        
        if (result.success) {
          toast({
            title: "Téléchargement démarré",
            description: `Le modèle ${ollamaModelName} est en cours de téléchargement via Ollama.`,
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        // Utiliser l'API de téléchargement Python
        await startModelDownload({
          model: modelId,
          consent: true
        });
      }
      
      // Une fois le téléchargement démarré avec succès
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInitiating(false);
    }
  };
  
  const isDownloading = downloadStatus.status === 'downloading';
  const isCompleted = downloadStatus.status === 'completed';
  const isError = downloadStatus.status === 'error';
  const modelSizeMb = downloadStatus.size_mb || 0;
  
  // Calculer l'ETA basé sur la vitesse moyenne
  const getEstimatedTimeRemaining = () => {
    if (!isDownloading || !modelSizeMb || !downloadStatus.downloaded_mb) return "Calcul en cours...";
    
    const downloadedMb = downloadStatus.downloaded_mb || 0;
    const remainingMb = modelSizeMb - downloadedMb;
    
    // Si on a démarré le téléchargement récemment
    if (downloadStatus.started_at && downloadStatus.progress > 0) {
      const elapsedTimeSeconds = (Date.now() - downloadStatus.started_at) / 1000;
      const downloadRateMbPerSecond = downloadedMb / elapsedTimeSeconds;
      
      if (downloadRateMbPerSecond > 0) {
        const remainingSeconds = remainingMb / downloadRateMbPerSecond;
        
        if (remainingSeconds < 60) {
          return `Environ ${Math.ceil(remainingSeconds)} secondes restantes`;
        } else if (remainingSeconds < 3600) {
          return `Environ ${Math.ceil(remainingSeconds / 60)} minutes restantes`;
        } else {
          return `Environ ${(remainingSeconds / 3600).toFixed(1)} heures restantes`;
        }
      }
    }
    
    return "Calcul en cours...";
  };
  
  const formatDownloadSize = () => {
    const downloadedMb = downloadStatus.downloaded_mb || 0;
    const totalMb = downloadStatus.size_mb || 0;
    
    if (totalMb > 1000) {
      return `${(downloadedMb / 1000).toFixed(2)} GB / ${(totalMb / 1000).toFixed(2)} GB`;
    } else {
      return `${downloadedMb.toFixed(1)} MB / ${totalMb.toFixed(1)} MB`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Télécharger {modelName}</DialogTitle>
          <DialogDescription>
            {useOllama 
              ? "Le modèle sera téléchargé via Ollama et disponible localement."
              : "Le modèle sera téléchargé et installé dans votre dossier de modèles local."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {(isDownloading || isCompleted) ? (
            <div className="space-y-4">
              <Progress value={downloadStatus.progress * 100} className="h-2" />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{downloadStatus.progress >= 1 ? "100%" : `${Math.round(downloadStatus.progress * 100)}%`}</span>
                <span>{formatDownloadSize()}</span>
              </div>
              
              {isDownloading && (
                <p className="text-sm text-center text-gray-500">{getEstimatedTimeRemaining()}</p>
              )}
              
              {isCompleted && (
                <p className="text-sm text-center text-green-600">Téléchargement terminé avec succès!</p>
              )}
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-2">
              <p>Une erreur est survenue: {downloadStatus.error}</p>
              <p className="text-sm mt-2">Veuillez réessayer ou vérifier votre connexion.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                {useOllama 
                  ? "Le modèle sera téléchargé via Ollama, ce qui permet une meilleure intégration et des performances optimisées." 
                  : "Voulez-vous télécharger ce modèle? Cela peut prendre un certain temps selon votre connexion internet."}
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                <p className="font-medium text-amber-800">Information</p>
                <p className="text-amber-700">
                  {useOllama 
                    ? "Ollama détecté! Le téléchargement sera optimisé pour votre matériel." 
                    : "Téléchargement standard via l'API Python."}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isInitiating}
          >
            Annuler
          </Button>
          
          {!isCompleted && !isDownloading && (
            <Button 
              onClick={handleStartDownload}
              disabled={isInitiating}
              className="gap-2"
            >
              {isInitiating && <Loader2 className="h-4 w-4 animate-spin" />}
              Télécharger maintenant
            </Button>
          )}
          
          {(isCompleted || isDownloading) && (
            <Button onClick={() => onOpenChange(false)}>
              {isCompleted ? "Fermer" : "Continuer en arrière-plan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
