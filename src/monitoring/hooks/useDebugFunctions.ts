
import { useEffect } from 'react';
import { ErrorLogger } from '../logger';
import { SentryMonitor } from '../sentry-integration';
import { LogLevel } from '../types';

/**
 * Hook qui expose les fonctions de diagnostic pour le débogage
 */
export const useDebugFunctions = () => {
  useEffect(() => {
    // Exposer les fonctions de gestion des journaux
    window.getFileCharErrorLogs = () => ErrorLogger.getLogs() as string[];
    window.clearFileCharErrorLogs = () => ErrorLogger.clearLogs();
    window.printFileCharErrorLogs = () => ErrorLogger.printLogs();
    
    // Exposer une fonction pour générer une erreur de test pour Sentry
    window.testSentryError = () => {
      try {
        // Générer une erreur intentionnelle pour tester Sentry
        throw new Error("Test error for Sentry");
      } catch (error) {
        SentryMonitor.captureException(error as Error, { 
          context: "Manual test",
          location: "testSentryError"
        });
        ErrorLogger.log(LogLevel.ERROR, "Test error sent to Sentry", error);
        return true;
      }
    };
    
    return () => {
      // Nettoyer les fonctions exposées
      delete window.getFileCharErrorLogs;
      delete window.clearFileCharErrorLogs;
      delete window.printFileCharErrorLogs;
      delete window.testSentryError;
    };
  }, []);
};

// Définitions des types pour TypeScript
declare global {
  interface Window {
    getFileCharErrorLogs?: () => string[];
    clearFileCharErrorLogs?: () => boolean;
    printFileCharErrorLogs?: () => number;
    testSentryError?: () => boolean;
  }
}
