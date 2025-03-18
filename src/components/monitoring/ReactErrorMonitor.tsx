
import { React, useEffect } from '@/core/ReactInstance';
import { toast } from '@/hooks/use-toast';
import { APP_STATE } from '@/compatibility/supabaseCompat';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * et les affiche de manière non intrusive à l'utilisateur
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Variable pour suivre les erreurs déjà signalées
    const reportedErrors = new Set<string>();
    
    // Fonction qui filtre les erreurs externes non liées à notre application
    const isExternalError = (message: string) => {
      const externalErrorPatterns = [
        'ambient-light-sensor',
        'battery',
        'facebook.com',
        'script src',
        'extension',
        'adblock',
        'google tag',
        'analytics'
      ];
      
      return externalErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
    };
    
    // Fonction de gestion des erreurs non capturées
    const handleUncaughtError = (event: ErrorEvent) => {
      // Ignorer les erreurs qui ne sont pas liées à notre application
      if (event.message && isExternalError(event.message)) {
        return;
      }
      
      // Créer un identifiant unique pour cette erreur pour éviter les doublons
      const errorId = `${event.filename}:${event.lineno}:${event.message}`;
      if (reportedErrors.has(errorId)) return;
      reportedErrors.add(errorId);
      
      console.error('Erreur non gérée:', event.error);
      
      // Éviter de notifier pour les erreurs de réseau qui sont déjà gérées
      if (event.message && (
        event.message.includes('loading chunk') || 
        event.message.includes('network') ||
        event.message.includes('Failed to fetch') ||
        event.message.includes('NetworkError')
      )) {
        return;
      }
      
      // Détection des problèmes liés à React
      const isReactError = event.message && (
        event.message.includes('React') ||
        event.message.includes('useLayoutEffect') ||
        event.message.includes('unstable_scheduleCallback') ||
        event.message.includes('createElement') ||
        event.message.includes('createContext')
      );
      
      if (isReactError) {
        console.warn('Erreur React potentielle détectée, tentative de récupération...');
        
        // Tenter de récupérer en réinitialisant l'instance React globale
        if (typeof window !== 'undefined' && window.React) {
          try {
            // Réassigner React depuis l'instance globale
            const ReactInstance = require('@/core/ReactInstance');
            if (ReactInstance.isReactFallbackMode()) {
              console.info('Tentative de récupération avec window.React');
              Object.assign(ReactInstance.React, window.React);
            }
          } catch (e) {
            console.error('Échec de la récupération React:', e);
          }
        }
        
        APP_STATE.setOfflineMode(true);
      }
      
      // Notification à l'utilisateur
      toast({
        title: "Problème détecté",
        description: isReactError 
          ? "Un problème d'interface a été détecté. L'application tente de récupérer automatiquement."
          : "Une erreur s'est produite. L'application tente de récupérer automatiquement.",
        variant: "destructive"
      });
    };

    // Fonction pour gérer les rejets de promesses non capturés
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignorer les erreurs qui ne sont pas liées à notre application
      if (event.reason?.message && isExternalError(event.reason.message)) {
        return;
      }
      
      // Créer un identifiant unique pour éviter les doublons
      const errorId = `promise:${event.reason?.message || 'unknown'}`;
      if (reportedErrors.has(errorId)) return;
      reportedErrors.add(errorId);
      
      console.error('Promesse rejetée non gérée:', event.reason);
      
      // Éviter de notifier pour certains types d'erreurs
      if (event.reason && (
        event.reason.message?.includes('aborted') ||
        event.reason.message?.includes('canceled')
      )) {
        return;
      }
      
      // Détecter les problèmes de connexion à l'API
      const isConnectionError = event.reason && (
        event.reason.message?.includes('fetch') ||
        event.reason.message?.includes('network') ||
        event.reason.message?.includes('ECONNREFUSED') ||
        event.reason.message?.includes('localhost')
      );
      
      if (isConnectionError) {
        console.warn('Problème de connexion détecté, activation du mode hors ligne...');
        APP_STATE.setOfflineMode(true);
      }
      
      // Notification à l'utilisateur
      toast({
        title: "Opération échouée",
        description: isConnectionError 
          ? "Problème de connexion détecté. Mode hors ligne activé." 
          : "Une requête a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    };
    
    // Nettoyer la liste des erreurs reportées périodiquement
    const intervalId = setInterval(() => {
      if (reportedErrors.size > 50) {
        reportedErrors.clear();
      }
    }, 60000); // Toutes les minutes

    // Enregistrement des gestionnaires d'événements
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Fonction de nettoyage pour supprimer les gestionnaires d'événements
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(intervalId);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};
