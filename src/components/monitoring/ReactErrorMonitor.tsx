
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { APP_STATE } from '@/compatibility/supabaseCompat';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * et les affiche de manière non intrusive à l'utilisateur
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Fonction de gestion des erreurs non capturées
    const handleUncaughtError = (event: ErrorEvent) => {
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
        event.message.includes('createElement')
      );
      
      if (isReactError) {
        console.warn('Erreur React potentielle détectée, mise en mode fallback...');
        APP_STATE.setOfflineMode(true);
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

    // Enregistrement des gestionnaires d'événements
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Fonction de nettoyage pour supprimer les gestionnaires d'événements
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};
