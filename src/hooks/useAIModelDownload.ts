
import { useState, useEffect, useCallback } from 'react';
import { ModelDownloadStatus } from './ai/types';
import { 
  fetchModelDownloadProgress, 
  fetchAvailableModels, 
  downloadModel 
} from './ai/strategies/modelDownloadStrategy';

export function useAIModelDownload(
  serviceType: string = 'cloud',
  localAIUrl: string | null = null
) {
  const [modelDownloadStatus, setModelDownloadStatus] = useState<ModelDownloadStatus | null>(null);
  const [modelsAvailable, setModelsAvailable] = useState<Array<{id: string, name: string, description: string}>>([]);

  // Vérifier périodiquement l'état du téléchargement du modèle
  useEffect(() => {
    let intervalId: number;
    
    const checkDownloadProgress = async () => {
      if (serviceType === 'local' && localAIUrl) {
        const status = await fetchModelDownloadProgress(localAIUrl);
        if (status) {
          setModelDownloadStatus(status);
        }
      }
    };
    
    // Vérifier immédiatement
    checkDownloadProgress();
    
    // Puis vérifier périodiquement si le téléchargement est en cours
    if (modelDownloadStatus?.status === 'downloading') {
      intervalId = window.setInterval(checkDownloadProgress, 3000);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [serviceType, localAIUrl, modelDownloadStatus?.status]);

  // Récupérer la liste des modèles disponibles
  useEffect(() => {
    const loadModels = async () => {
      const models = await fetchAvailableModels(serviceType, localAIUrl);
      setModelsAvailable(models);
    };
    
    loadModels();
  }, [localAIUrl, serviceType]);

  // Fonction pour télécharger un modèle
  const startModelDownload = useCallback(async (modelId: string) => {
    const success = await downloadModel(modelId, localAIUrl, serviceType);
    
    if (success) {
      // Mettre à jour le statut local immédiatement pour une meilleure UX
      const newStatus = await fetchModelDownloadProgress(localAIUrl);
      if (newStatus) {
        setModelDownloadStatus(newStatus);
      }
    }
    
    return success;
  }, [localAIUrl, serviceType]);

  return {
    modelDownloadStatus,
    modelsAvailable,
    downloadModel: startModelDownload,
    refreshModelStatus: async () => {
      const status = await fetchModelDownloadProgress(localAIUrl);
      if (status) setModelDownloadStatus(status);
      return status;
    },
    refreshAvailableModels: async () => {
      const models = await fetchAvailableModels(serviceType, localAIUrl);
      setModelsAvailable(models);
      return models;
    }
  };
}
