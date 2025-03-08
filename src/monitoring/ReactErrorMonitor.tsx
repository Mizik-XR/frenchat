
import { useEffect } from 'react';
import { APP_STATE } from '@/integrations/supabase/client';
import { ErrorLogger } from './logger';
import { ErrorDetector } from './error-detector';
import { NotificationManager } from './notification-manager';
import { ErrorType, LogLevel } from './types';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * Version refactorisée avec une architecture modulaire
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Log des informations du navigateur pour diagnostics
    const browserInfo = ErrorDetector.getBrowserInfo();
    ErrorLogger.log(LogLevel.INFO, "Informations du navigateur", browserInfo);
    ErrorLogger.log(LogLevel.INFO, "Moniteur d'erreurs React activé");

    // Ajout d'un gestionnaire d'erreurs global
    window.onerror = function(message, source, lineno, colno, error) {
      const errorDetails = {
        message,
        source,
        location: `Ligne ${lineno}, Colonne ${colno}`,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      };
      
      ErrorLogger.log(LogLevel.ERROR, "Erreur JavaScript globale détectée", errorDetails);
      
      // Traitement spécifique selon le type d'erreur
      if (error) {
        const errorType = ErrorDetector.detectErrorType(error);
        ErrorDetector.processError(error);
        NotificationManager.showErrorNotification(error, errorType);
      }
      
      return false; // Permettre la propagation normale de l'erreur
    };

    // Surveiller les erreurs de chargement de ressources
    window.addEventListener('error', function(event) {
      // Ignorer les erreurs déjà capturées par window.onerror
      if (event.error) return;
      
      // Capture les erreurs de chargement de ressources (scripts, CSS, images, etc.)
      if (ErrorDetector.isResourceLoadingError(event)) {
        const target = event.target as HTMLElement;
        const resourceType = target.tagName.toLowerCase();
        const resourceUrl = (target as any).src || (target as any).href || 'inconnu';
        
        ErrorLogger.log(LogLevel.WARN, `Erreur de chargement de ressource [${resourceType}]`, {
          url: resourceUrl,
          element: resourceType
        });
        
        // Notification uniquement pour les ressources critiques
        if (resourceType === 'script' || resourceUrl.includes('main.js') || resourceUrl.includes('index.js')) {
          NotificationManager.showErrorNotification(event, ErrorType.RESOURCE_LOADING);
        }
      }
    }, true);

    // Fonction de gestion des erreurs non capturées
    const handleUncaughtError = (event: ErrorEvent) => {
      if (!event.error) return;
      
      console.error('Erreur non gérée:', event.error);
      
      // Traitement via le détecteur d'erreurs
      const errorType = ErrorDetector.detectErrorType(event.error);
      ErrorDetector.processError(event.error);
      
      // Notification à l'utilisateur pour les erreurs critiques
      if (errorType === ErrorType.REACT_RENDERING || errorType === ErrorType.MODULE_LOADING) {
        NotificationManager.showErrorNotification(event.error, errorType);
      }
    };

    // Fonction pour gérer les rejets de promesses non capturés
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      ErrorLogger.log(LogLevel.ERROR, 'Promesse rejetée non gérée', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
      
      // Vérifier si c'est une erreur réseau
      const isConnectionError = ErrorDetector.isNetworkError(event.reason);
      
      if (isConnectionError) {
        console.warn('Problème de connexion détecté, activation du mode hors ligne...');
        if (APP_STATE && typeof APP_STATE.setOfflineMode === 'function') {
          APP_STATE.setOfflineMode(true);
        }
        
        // Notification à l'utilisateur
        NotificationManager.showErrorNotification(
          event.reason, 
          ErrorType.NETWORK
        );
      }
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

  // Fonction pour exposer les méthodes de journalisation à l'objet window
  useEffect(() => {
    // Exposer les fonctions de gestion des journaux
    window.getFileCharErrorLogs = () => ErrorLogger.getLogs();
    window.clearFileCharErrorLogs = () => ErrorLogger.clearLogs();
    window.printFileCharErrorLogs = () => ErrorLogger.printLogs();
    
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
    getFileCharErrorLogs?: () => any[];
    clearFileCharErrorLogs?: () => boolean;
    printFileCharErrorLogs?: () => number;
  }
}
