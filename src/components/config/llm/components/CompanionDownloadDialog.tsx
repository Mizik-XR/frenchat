
import React, { useState } from 'react';
import { useModelDownload } from '@/hooks/useModelDownload';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
  const [consent, setConsent] = useState(false);
  const { downloadStatus, startModelDownload } = useModelDownload();
  
  const isDownloading = downloadStatus.status === 'downloading';
  const isCompleted = downloadStatus.status === 'completed';
  const hasError = downloadStatus.status === 'error';
  
  const handleDownload = async () => {
    if (!consent) return;
    
    try {
      await startModelDownload({
        model: modelId,
        consent: true
      });
    } catch (error) {
      console.error("Erreur lors du démarrage du téléchargement:", error);
    }
  };
  
  const handleClose = () => {
    if (isCompleted && onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB < 1000) {
      return `${sizeInMB.toFixed(0)} MB`;
    }
    return `${(sizeInMB / 1000).toFixed(1)} GB`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téléchargement du modèle {modelName}</DialogTitle>
          <DialogDescription>
            Ce modèle doit être téléchargé pour être utilisé en local.
          </DialogDescription>
        </DialogHeader>
        
        {!isDownloading && !isCompleted && !hasError && (
          <>
            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Le modèle {modelName} ({formatSize(downloadStatus.size_mb || 5000)}) 
                  sera téléchargé sur votre ordinateur. Cette opération peut prendre plusieurs minutes 
                  selon votre connexion Internet.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="consent" 
                  checked={consent} 
                  onCheckedChange={(checked) => setConsent(checked === true)}
                />
                <Label htmlFor="consent">
                  Je consens au téléchargement de ce modèle sur mon ordinateur
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={!consent}
                className="inline-flex items-center"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger le modèle
              </Button>
            </DialogFooter>
          </>
        )}
        
        {isDownloading && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <span>Téléchargement en cours...</span>
              <span className="text-sm text-gray-500">
                {Math.round(downloadStatus.progress * 100)}%
              </span>
            </div>
            
            <Progress value={downloadStatus.progress * 100} className="w-full" />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatSize(downloadStatus.downloaded_mb || 0)}</span>
              <span>sur {formatSize(downloadStatus.size_mb || 0)}</span>
            </div>
            
            <p className="text-sm text-gray-500 italic mt-4">
              Veuillez ne pas fermer cette fenêtre pendant le téléchargement.
            </p>
          </div>
        )}
        
        {isCompleted && (
          <div className="space-y-4 py-4">
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span>Téléchargement terminé avec succès!</span>
            </div>
            
            <p className="text-sm text-gray-600">
              Le modèle {modelName} est maintenant disponible pour utilisation en local.
            </p>
            
            <DialogFooter>
              <Button onClick={handleClose}>Fermer</Button>
            </DialogFooter>
          </div>
        )}
        
        {hasError && (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {downloadStatus.error || "Une erreur est survenue lors du téléchargement du modèle."}
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={!consent}
              >
                Réessayer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
