
/**
 * Configuration du moniteur d'erreurs
 * Définit les paramètres et les filtres pour la surveillance des erreurs
 */

/**
 * Liste des erreurs à ignorer
 * Ces erreurs sont connues et peuvent être ignorées en toute sécurité
 */
export const ignoredErrors = [
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

/**
 * Vérifie si une erreur doit être ignorée
 * @param message Le message d'erreur à vérifier
 * @returns true si l'erreur doit être ignorée, false sinon
 */
export const shouldIgnoreError = (message: string): boolean => {
  return ignoredErrors.some(err => message.includes(err));
};

/**
 * Configuration pour les toasts de notification d'erreur
 */
export const errorNotificationConfig = {
  /**
   * Titre pour les notifications d'erreur non capturées
   */
  uncaughtErrorTitle: "Problème détecté",
  
  /**
   * Description pour les notifications d'erreur non capturées
   */
  uncaughtErrorDescription: "Une erreur s'est produite. L'application tente de récupérer automatiquement.",
  
  /**
   * Titre pour les promesses rejetées non gérées
   */
  unhandledRejectionTitle: "Opération échouée",
  
  /**
   * Description pour les promesses rejetées non gérées
   */
  unhandledRejectionDescription: "Une requête a échoué. Veuillez réessayer."
};
