
import { useEffect } from 'react';
import { ErrorLogger } from './logger';
import { LogLevel } from './types';
import { SentryMonitor } from './sentry-integration';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * Version simplifiée avec initialisation progressive
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Éviter les conflits d'initialisation avec React 18
    let timeoutId: number;
    
    const initMonitoring = () => {
      try {
        console.log("Initialisation du moniteur d'erreurs React");
        
        // Initialiser Sentry si ce n'est pas déjà fait
        if (!SentryMonitor.isReady()) {
          console.log("Réinitialisation de Sentry depuis ReactErrorMonitor");
          SentryMonitor.initialize();
        }
        
        // Log des informations du navigateur pour diagnostics
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookiesEnabled: navigator.cookieEnabled,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          online: navigator.onLine
        };
        
        ErrorLogger.log(LogLevel.INFO, "Informations du navigateur", browserInfo);
        ErrorLogger.log(LogLevel.INFO, "Moniteur d'erreurs React activé");
      } catch (error) {
        console.error("Erreur lors de l'initialisation du monitoring:", error);
      }
    };
    
    // Retarder l'initialisation pour éviter les conflits avec React 18
    timeoutId = window.setTimeout(initMonitoring, 1500);
    
    return () => {
      // Nettoyer le timeout lors du démontage du composant
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};
