
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import * as Sentry from "@sentry/react";

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * et les affiche de manière non intrusive à l'utilisateur
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Création d'un journal d'erreurs local
    const errorLog: string[] = [];
    
    const logToConsole = (message: string, data?: any) => {
      // Ajouter un horodatage aux messages
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;
      
      // Console log standard
      console.log(logMessage);
      
      // Ajouter au journal d'erreurs
      errorLog.push(logMessage);
      if (data) {
        try {
          const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
          errorLog.push(`[DATA] ${dataStr}`);
        } catch (e) {
          errorLog.push(`[DATA] Impossible de sérialiser les données: ${String(e)}`);
        }
      }
      
      // Stocker dans localStorage pour récupération ultérieure
      try {
        localStorage.setItem('filechat_error_log', JSON.stringify(errorLog.slice(-100))); // Garder seulement les 100 dernières entrées
      } catch (e) {
        console.warn("Impossible de stocker les journaux dans localStorage", e);
      }
    };

    // Log des informations du navigateur pour diagnostics
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
    
    // Exécuter au démarrage
    logBrowserInfo();
    logToConsole("Moniteur d'erreurs React activé");

    // Liste des erreurs à ignorer
    const ignoredErrors = [
      'Sentry',
      'cdn',
      'unstable_scheduleCallback',
      'ResizeObserver',
      'Mt',
      'Tt',
      'before initialization',
      'aborted',
      'Failed to fetch'
    ];

    // Fonction pour vérifier si une erreur doit être ignorée
    const shouldIgnoreError = (message: string): boolean => {
      return ignoredErrors.some(err => message.includes(err));
    };

    // Fonction de gestion des erreurs non capturées
    const handleUncaughtError = (event: ErrorEvent) => {
      // Ignorer certaines erreurs connues
      if (shouldIgnoreError(event.message)) {
        console.warn('Erreur ignorée:', event.message);
        return;
      }
      
      console.error('Erreur non gérée:', event.error);
      
      logToConsole("Erreur React non capturée", {
        message: event.message,
        filename: event.filename,
        stack: event.error?.stack
      });
      
      // Envoi à Sentry
      if (event.error && Sentry) {
        Sentry.captureException(event.error, {
          extra: {
            source: "ReactErrorMonitor",
            filename: event.filename,
            automatic: true
          }
        });
      }
      
      // Notification à l'utilisateur
      toast({
        title: "Problème détecté",
        description: "Une erreur s'est produite. L'application tente de récupérer automatiquement.",
        variant: "destructive"
      });
    };

    // Fonction pour gérer les rejets de promesses non capturés
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignorer certaines erreurs connues
      const reason = event.reason?.message || String(event.reason);
      if (shouldIgnoreError(reason)) {
        console.warn('Rejet de promesse ignoré:', reason);
        return;
      }
      
      logToConsole('Promesse rejetée non gérée:', {
        reason: reason,
        stack: event.reason?.stack
      });
      
      // Envoi à Sentry
      if (Sentry) {
        Sentry.captureException(new Error(`Promise rejection: ${reason}`), {
          extra: {
            source: "ReactErrorMonitor", 
            type: "unhandledRejection",
            reason: reason,
            stack: event.reason?.stack
          }
        });
      }
      
      // Notification à l'utilisateur
      toast({
        title: "Opération échouée",
        description: "Une requête a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    };

    // Enregistrement des gestionnaires d'événements
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Fonction de nettoyage pour supprimer les gestionnaires d'événements
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Fonction pour exposer le journal d'erreurs à l'objet window pour le débogage
  useEffect(() => {
    // Exposer une fonction pour récupérer les journaux d'erreurs
    window.getFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        return logs ? JSON.parse(logs) : [];
      } catch (e) {
        console.error("Erreur lors de la récupération des journaux", e);
        return [];
      }
    };
    
    // Fonction pour effacer les journaux
    window.clearFileCharErrorLogs = () => {
      try {
        localStorage.removeItem('filechat_error_log');
        return true;
      } catch (e) {
        console.error("Erreur lors de la suppression des journaux", e);
        return false;
      }
    };
    
    // Fonction pour afficher les journaux dans la console
    window.printFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        const parsedLogs = logs ? JSON.parse(logs) : [];
        console.group("FileChat - Journaux d'erreurs");
        parsedLogs.forEach((log: string) => console.log(log));
        console.groupEnd();
        return parsedLogs.length;
      } catch (e) {
        console.error("Erreur lors de l'affichage des journaux", e);
        return 0;
      }
    };
    
    return () => {
      // Nettoyer les fonctions exposées
      delete window.getFileCharErrorLogs;
      delete window.clearFileCharErrorLogs;
      delete window.printFileCharErrorLogs;
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};

// Ajouter les méthodes à l'interface Window
declare global {
  interface Window {
    getFileCharErrorLogs?: () => string[];
    clearFileCharErrorLogs?: () => boolean;
    printFileCharErrorLogs?: () => number;
  }
}
