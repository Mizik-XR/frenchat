
/**
 * Hook pour gérer les erreurs non capturées et les rejets de promesses
 * Fournit des gestionnaires d'événements pour window.onerror et window.onunhandledrejection
 */
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import * as Sentry from "@sentry/react";

export const useErrorHandlers = (logToConsole: (message: string, data?: any) => void) => {
  useEffect(() => {
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
  }, [logToConsole]);
};
