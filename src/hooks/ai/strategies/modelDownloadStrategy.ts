
import { toast } from '@/hooks/use-toast';
import { ModelDownloadStatus } from '../types';

/**
 * Utilitaire pour gérer le téléchargement des modèles
 */
export const fetchModelDownloadProgress = async (localAIUrl: string | null): Promise<ModelDownloadStatus | null> => {
  if (!localAIUrl) return null;
  
  try {
    const response = await fetch(`${localAIUrl}/download-progress`);
    if (response.ok) {
      const status = await response.json();
      return status;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du téléchargement:", error);
  }
  return null;
};

export const fetchAvailableModels = async (serviceType: string, localAIUrl: string | null) => {
  if (serviceType === 'local' && localAIUrl) {
    try {
      const response = await fetch(`${localAIUrl}/models`);
      if (response.ok) {
        const data = await response.json();
        return data.available || [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des modèles:", error);
    }
  }
  return [];
};

export const downloadModel = async (modelId: string, localAIUrl: string | null, serviceType: string) => {
  if (serviceType !== 'local' || !localAIUrl) {
    toast({
      title: "Erreur",
      description: "Impossible de télécharger le modèle en mode cloud",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // Vérifier le statut actuel du téléchargement
    const currentStatus = await fetchModelDownloadProgress(localAIUrl);
    
    // Vérifier si le téléchargement est déjà en cours
    if (currentStatus?.status === 'downloading') {
      toast({
        title: "Téléchargement en cours",
        description: `Le téléchargement du modèle ${currentStatus.model} est déjà en cours (${currentStatus.progress}%)`,
      });
      return false;
    }
    
    // Estimer la taille du modèle
    const estimatedSize = modelId.includes('Mixtral') ? 26 : 13; // GB
    
    const response = await fetch(`${localAIUrl}/download-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        consent: true
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      
      toast({
        title: "Téléchargement démarré",
        description: `Le modèle ${modelId} est en cours de téléchargement (environ ${estimatedSize} GB)`,
      });
      
      return true;
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors du téléchargement");
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement du modèle:", error);
    toast({
      title: "Erreur",
      description: error instanceof Error ? error.message : "Erreur lors du téléchargement du modèle",
      variant: "destructive"
    });
    return false;
  }
};
