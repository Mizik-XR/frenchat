
import { useState, useEffect, useCallback } from 'react';
import { ModelDownloadStatus, ModelDownloadRequest } from '@/hooks/ai/types';
import { toast } from '@/hooks/use-toast';
import { needsCorsProxy, corsSafeFetch } from '@/utils/environment/corsProxy';
import { isLovableEnvironment } from '@/utils/environment';

// URL de l'API avec fallback - Inclut la logique pour détecter Lovable
const API_URL = (() => {
  // En environnement Lovable, utiliser un mock
  if (isLovableEnvironment()) {
    return '/api-mock';
  }
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
})();

export function useModelDownload() {
  const [downloadStatus, setDownloadStatus] = useState<ModelDownloadStatus>({
    status: 'idle',
    model: null,
    progress: 0,
    started_at: null,
    completed_at: null,
    error: null,
    size_mb: 0,
    downloaded_mb: 0
  });
  const [lastFetchError, setLastFetchError] = useState<Error | null>(null);

  // Fonction pour récupérer l'état actuel du téléchargement
  const fetchDownloadProgress = async () => {
    try {
      // En environnement Lovable, simuler une réponse
      if (isLovableEnvironment()) {
        return {
          status: 'idle',
          model: null,
          progress: 0,
          size_mb: 0,
          downloaded_mb: 0
        };
      }

      const response = await corsSafeFetch(`${API_URL}/download-progress`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la progression: ${response.statusText}`);
      }

      const data = await response.json();
      setDownloadStatus(data);
      setLastFetchError(null);
      return data;
    } catch (error) {
      // Éviter de logger des erreurs répétées du même type
      if (!lastFetchError || lastFetchError.message !== (error as Error).message) {
        console.error("Erreur lors de la récupération de la progression:", error);
        setLastFetchError(error as Error);
      }
      
      // Ne pas modifier l'état si on est dans Lovable
      if (!isLovableEnvironment()) {
        setDownloadStatus(prev => ({
          ...prev,
          error: (error as Error).message
        }));
      }
      
      return null;
    }
  };

  // Fonction pour démarrer un téléchargement de modèle
  const startModelDownload = async (request: ModelDownloadRequest) => {
    try {
      // En environnement Lovable, simuler le démarrage d'un téléchargement
      if (isLovableEnvironment()) {
        setDownloadStatus({
          status: 'downloading',
          model: request.model,
          progress: 0.05,
          started_at: Date.now(),
          completed_at: null,
          error: null,
          size_mb: 4000,
          downloaded_mb: 200
        });
        
        toast({
          title: "Téléchargement simulé",
          description: `Dans l'environnement de prévisualisation, le téléchargement est simulé.`,
        });
        
        return { model: request.model, progress: 0.05 };
      }

      const response = await corsSafeFetch(`${API_URL}/download-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mettre à jour l'état local
      setDownloadStatus({
        status: 'downloading',
        model: data.model,
        progress: data.progress,
        started_at: Date.now(),
        completed_at: null,
        error: null,
        size_mb: data.estimated_size_mb,
        downloaded_mb: 0
      });

      // Notification pour l'utilisateur
      toast({
        title: "Téléchargement démarré",
        description: `Le modèle ${data.model} est en cours de téléchargement.`,
      });

      return data;
    } catch (error: any) {
      console.error("Erreur lors du démarrage du téléchargement:", error);
      
      // Notification d'erreur
      toast({
        title: "Erreur de téléchargement",
        description: error.message,
        variant: "destructive"
      });
      
      setDownloadStatus(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));
      
      throw error;
    }
  };

  // Effet pour mettre à jour l'état du téléchargement périodiquement
  useEffect(() => {
    let intervalId: number | undefined;

    const updateProgress = async () => {
      const status = await fetchDownloadProgress();
      
      // Si le téléchargement est terminé ou en erreur, arrêter les mises à jour
      if (status && (status.status === 'completed' || status.status === 'error')) {
        if (status.status === 'completed') {
          toast({
            title: "Téléchargement terminé",
            description: `Le modèle ${status.model} a été téléchargé avec succès.`,
          });
        } else if (status.status === 'error') {
          toast({
            title: "Erreur de téléchargement",
            description: status.error || "Une erreur est survenue lors du téléchargement.",
            variant: "destructive"
          });
        }
        
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
      
      // Simulation de progression pour Lovable
      if (isLovableEnvironment() && downloadStatus.status === 'downloading') {
        setDownloadStatus(prev => {
          const newProgress = Math.min(prev.progress + 0.05, 1);
          const newDownloadedMb = Math.round(prev.size_mb * newProgress);
          
          // Compléter le téléchargement simulé après 95%
          if (newProgress >= 0.95) {
            setTimeout(() => {
              setDownloadStatus({
                ...prev,
                status: 'completed',
                progress: 1,
                completed_at: Date.now(),
                downloaded_mb: prev.size_mb
              });
              
              toast({
                title: "Téléchargement simulé terminé",
                description: `Le modèle ${prev.model} a été simulé avec succès.`,
              });
            }, 2000);
          }
          
          return {
            ...prev,
            progress: newProgress,
            downloaded_mb: newDownloadedMb
          };
        });
      }
    };

    // Vérifier le statut initial
    fetchDownloadProgress();

    // Mettre en place la mise à jour périodique si un téléchargement est en cours
    if (downloadStatus.status === 'downloading') {
      intervalId = window.setInterval(updateProgress, isLovableEnvironment() ? 500 : 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [downloadStatus.status]);

  return {
    downloadStatus,
    startModelDownload,
    fetchDownloadProgress
  };
}
