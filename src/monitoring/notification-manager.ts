
import { toast } from '@/hooks/use-toast';
import { ErrorType } from './types';

/**
 * Gestionnaire de notifications pour les erreurs et avertissements
 * Affiche des notifications appropriées à l'utilisateur
 */
export class NotificationManager {
  /**
   * Affiche une notification d'erreur à l'utilisateur
   */
  static showErrorNotification(error: any, errorType: ErrorType): void {
    let title = "Problème détecté";
    let description = "Une erreur s'est produite. L'application tente de récupérer automatiquement.";
    
    // Personnaliser le message en fonction du type d'erreur
    switch (errorType) {
      case ErrorType.NETWORK:
        title = "Problème de connexion";
        description = "La connexion au serveur a échoué. Mode hors ligne activé.";
        break;
        
      case ErrorType.MODULE_LOADING:
        title = "Erreur de chargement";
        description = "Un composant n'a pas pu être chargé correctement.";
        break;
        
      case ErrorType.REACT_RENDERING:
        title = "Erreur d'affichage";
        description = "Un problème est survenu lors de l'affichage de l'interface.";
        break;
        
      case ErrorType.RESOURCE_LOADING:
        title = "Ressource manquante";
        description = "Une ressource n'a pas pu être chargée (image, fichier, etc.).";
        break;
        
      case ErrorType.API_ERROR:
        title = "Erreur d'API";
        description = "La requête vers l'API a échoué. Veuillez réessayer.";
        break;
    }
    
    // Afficher la notification avec toast
    toast({
      title,
      description,
      variant: "destructive"
    });
  }

  /**
   * Affiche une notification d'avertissement à l'utilisateur
   */
  static showWarningNotification(message: string): void {
    toast({
      title: "Avertissement",
      description: message,
      variant: "default"
    });
  }

  /**
   * Affiche une notification de succès à l'utilisateur
   */
  static showSuccessNotification(message: string): void {
    toast({
      title: "Succès",
      description: message,
      variant: "default"
    });
  }

  /**
   * Affiche une notification de récupération d'erreur
   */
  static showRecoveryNotification(): void {
    toast({
      title: "Application récupérée",
      description: "L'application a résolu les problèmes précédents et fonctionne normalement.",
      variant: "default"
    });
  }

  /**
   * Affiche une notification de mode hors ligne
   */
  static showOfflineModeNotification(isOffline: boolean): void {
    if (isOffline) {
      toast({
        title: "Mode hors ligne activé",
        description: "L'application fonctionne maintenant en mode hors ligne.",
        variant: "default"
      });
    } else {
      toast({
        title: "Connexion rétablie",
        description: "L'application est reconnectée et fonctionne normalement.",
        variant: "default"
      });
    }
  }
}
