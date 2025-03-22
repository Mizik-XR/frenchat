
import { useState, useEffect } from 'react';
import { ModelDownloadStatus, ModelDownloadRequest } from '@/hooks/ai/types';
import { toast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

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

  // Fonction pour récupérer l'état actuel du téléchargement
  const fetchDownloadProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/download-progress`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la progression: ${response.statusText}`);
      }

      const data = await response.json();
      setDownloadStatus(data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la progression:", error);
      return null;
    }
  };

  // Fonction pour démarrer un téléchargement de modèle
  const startModelDownload = async (request: ModelDownloadRequest) => {
    try {
      const response = await fetch(`${API_URL}/download-model`, {
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

  // Effet pour mettre à jour l'état du téléchargement
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
    };

    // Vérifier le statut initial
    fetchDownloadProgress();

    // Mettre en place la mise à jour périodique si un téléchargement est en cours
    if (downloadStatus.status === 'downloading') {
      intervalId = window.setInterval(updateProgress, 2000);
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
