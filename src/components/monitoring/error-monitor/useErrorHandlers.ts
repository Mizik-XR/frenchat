
/**
 * Hook pour gérer les erreurs non capturées et les rejets de promesses
 * Fournit des gestionnaires d'événements pour window.onerror et window.onunhandledrejection
 */
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import * as Sentry from "@sentry/react";
import { shouldIgnoreError, errorNotificationConfig } from './config';
import { useSentrySession } from './useSentrySession';

export const useErrorHandlers = (logToConsole: (message: string, data?: any) => void) => {
  const { captureException } = useSentrySession();

  useEffect(() => {
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
        captureException(event.error, {
          extra: {
            source: "ReactErrorMonitor",
            filename: event.filename,
            automatic: true
          }
        });
      }
      
      // Notification à l'utilisateur
      toast({
        title: errorNotificationConfig.uncaughtErrorTitle,
        description: errorNotificationConfig.uncaughtErrorDescription,
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
        captureException(new Error(`Promise rejection: ${reason}`), {
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
        title: errorNotificationConfig.unhandledRejectionTitle,
        description: errorNotificationConfig.unhandledRejectionDescription,
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
  }, [logToConsole, captureException]);
};
