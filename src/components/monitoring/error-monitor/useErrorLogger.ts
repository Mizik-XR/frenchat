
/**
 * Hook pour la journalisation des erreurs
 * Fournit des fonctions pour enregistrer les erreurs dans un journal local
 */
import { useEffect, useRef } from 'react';

export const useErrorLogger = () => {
  // Journal d'erreurs maintenu en mémoire
  const errorLogRef = useRef<string[]>([]);

  // Fonction pour journaliser les messages avec horodatage
  const logToConsole = (message: string, data?: any) => {
    // Ajouter un horodatage aux messages
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // Console log standard
    console.log(logMessage);
    
    // Ajouter au journal d'erreurs
    errorLogRef.current.push(logMessage);
    if (data) {
      try {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        errorLogRef.current.push(`[DATA] ${dataStr}`);
      } catch (e) {
        errorLogRef.current.push(`[DATA] Impossible de sérialiser les données: ${String(e)}`);
      }
    }
    
    // Stocker dans localStorage pour récupération ultérieure
    try {
      localStorage.setItem('filechat_error_log', JSON.stringify(errorLogRef.current.slice(-100))); // Garder seulement les 100 dernières entrées
    } catch (e) {
      console.warn("Impossible de stocker les journaux dans localStorage", e);
    }
  };

  // Fonction pour journaliser les informations du navigateur
  const logBrowserInfo = () => {
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform, 
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    logToConsole("Informations du navigateur", browserInfo);
  };

  // Initialisation du logger
  useEffect(() => {
    // Charger les logs existants depuis localStorage
    try {
      const savedLogs = localStorage.getItem('filechat_error_log');
      if (savedLogs) {
        errorLogRef.current = JSON.parse(savedLogs);
      }
    } catch (e) {
      console.warn("Impossible de récupérer les journaux depuis localStorage", e);
    }

    // Log initial
    logBrowserInfo();
    logToConsole("Moniteur d'erreurs React activé");
  }, []);

  return {
    logToConsole,
    logBrowserInfo
  };
};
