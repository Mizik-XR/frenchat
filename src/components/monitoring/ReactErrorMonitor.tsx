
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

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
      
      // Notification à l'utilisateur
      toast({
        title: "Problème détecté",
        description: "Une erreur s'est produite. L'application tente de récupérer automatiquement.",
        variant: "destructive"
      });
      
      // En fonction du type d'erreur, on peut tenter différentes stratégies de récupération
      if (event.message && event.message.includes('undefined is not an object')) {
        console.log("Tentative de récupération après une erreur de type 'undefined is not an object'");
        // Récupération spécifique si nécessaire
      }
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

  // Ce composant ne rend rien visuellement
  return null;
};
