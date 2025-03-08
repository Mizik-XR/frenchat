
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { APP_STATE } from '@/integrations/supabase/client';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * et les affiche de manière non intrusive à l'utilisateur
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Création d'un journal d'erreurs local
    const errorLog: string[] = [];
    
    const logToNetlify = (message: string, data?: any) => {
      // Ajouter un horodatage aux messages
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;
      
      // Console log standard
      console.log(logMessage);
      
      // Ajouter au journal d'erreurs
      errorLog.push(logMessage);
      if (data) {
        try {
          const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
          errorLog.push(`[DATA] ${dataStr}`);
        } catch (e) {
          errorLog.push(`[DATA] Impossible de sérialiser les données: ${String(e)}`);
        }
      }
      
      // Stocker dans localStorage pour récupération ultérieure
      try {
        localStorage.setItem('filechat_error_log', JSON.stringify(errorLog.slice(-100))); // Garder seulement les 100 dernières entrées
      } catch (e) {
        console.warn("Impossible de stocker les journaux dans localStorage", e);
      }
    };

    // Log des informations du navigateur pour diagnostics
    const logBrowserInfo = () => {
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform, 
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: navigator.connection ? {
          type: (navigator.connection as any).effectiveType,
          downlink: (navigator.connection as any).downlink,
          rtt: (navigator.connection as any).rtt,
        } : 'Non disponible'
      };
      
      logToNetlify("Informations du navigateur", browserInfo);
    };
    
    // Exécuter au démarrage
    logBrowserInfo();
    logToNetlify("Moniteur d'erreurs React activé");

    // Ajout d'un gestionnaire d'erreurs global étendu
    window.onerror = function(message, source, lineno, colno, error) {
      const errorDetails = {
        message,
        source,
        location: `Ligne ${lineno}, Colonne ${colno}`,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      };
      
      logToNetlify("Erreur JavaScript globale détectée", errorDetails);
      
      // Détection spécifique des erreurs de chargement de modules
      if (message && (
        message.toString().includes("Cannot access") ||
        message.toString().includes("before initialization") ||
        message.toString().includes("is not defined") ||
        message.toString().includes("Failed to load module")
      )) {
        logToNetlify("ERREUR CRITIQUE NETLIFY: Problème de chargement de module détecté", message);
      }
      
      return false; // Permettre la propagation normale de l'erreur
    };

    // Surveiller les erreurs de chargement de ressources
    window.addEventListener('error', function(event) {
      // Ignorer les erreurs déjà capturées par window.onerror
      if (event.error) return;
      
      // Capture les erreurs de chargement de ressources (scripts, CSS, images, etc.)
      if (event.target && (event.target as HTMLElement).tagName) {
        const target = event.target as HTMLElement;
        const resourceType = target.tagName.toLowerCase();
        const resourceUrl = (target as any).src || (target as any).href || 'inconnu';
        
        logToNetlify(`Erreur de chargement de ressource [${resourceType}]`, {
          url: resourceUrl,
          element: resourceType
        });
      }
    }, true);

    // Fonction de gestion des erreurs non capturées
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error('Erreur non gérée:', event.error);
      
      // Détails supplémentaires pour le diagnostic
      const errorDetails = {
        message: event.message,
        filename: event.filename,
        stack: event.error?.stack,
        cause: event.error?.cause,
        timestamp: new Date().toISOString()
      };
      
      logToNetlify("Erreur React non capturée", errorDetails);
      
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
        logToNetlify("ERREUR CRITIQUE: Erreur React détectée, activation du mode fallback", event.message);
        APP_STATE.isOfflineMode = true;
      }
      
      // Détection de problèmes de chargement de modules
      if (event.message && event.message.includes('Cannot access') && event.message.includes('before initialization')) {
        logToNetlify("ERREUR CRITIQUE NETLIFY: Problème d'initialisation de module détecté", {
          message: event.message,
          location: event.filename,
          stackTrace: event.error?.stack
        });
        
        // Tentative de récupération
        try {
          document.body.innerHTML += `
            <div style="position: fixed; bottom: 10px; right: 10px; background: #f44336; color: white; padding: 10px; border-radius: 4px; z-index: 9999;">
              Erreur de chargement détectée. <button onclick="window.location.reload()" style="background: white; color: #f44336; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">Recharger</button>
            </div>
          `;
        } catch (e) {
          console.error("Impossible d'ajouter la notification d'erreur", e);
        }
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
      logToNetlify('Promesse rejetée non gérée:', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
      
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

  // Fonction pour exposer le journal d'erreurs à l'objet window pour le débogage
  useEffect(() => {
    // Exposer une fonction pour récupérer les journaux d'erreurs
    window.getFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        return logs ? JSON.parse(logs) : [];
      } catch (e) {
        console.error("Erreur lors de la récupération des journaux", e);
        return [];
      }
    };
    
    // Fonction pour effacer les journaux
    window.clearFileCharErrorLogs = () => {
      try {
        localStorage.removeItem('filechat_error_log');
        return true;
      } catch (e) {
        console.error("Erreur lors de la suppression des journaux", e);
        return false;
      }
    };
    
    // Fonction pour afficher les journaux dans la console
    window.printFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        const parsedLogs = logs ? JSON.parse(logs) : [];
        console.group("FileChat - Journaux d'erreurs");
        parsedLogs.forEach((log: string) => console.log(log));
        console.groupEnd();
        return parsedLogs.length;
      } catch (e) {
        console.error("Erreur lors de l'affichage des journaux", e);
        return 0;
      }
    };
    
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
    getFileCharErrorLogs?: () => string[];
    clearFileCharErrorLogs?: () => boolean;
    printFileCharErrorLogs?: () => number;
  }
}
