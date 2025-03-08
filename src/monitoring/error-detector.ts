
import { ErrorLogger } from './logger';
import { ErrorType, LogLevel, BrowserInfo } from './types';
import { APP_STATE } from '@/integrations/supabase/client';

/**
 * Service de détection des erreurs pour l'application
 * Analyse les erreurs et les catégorise pour un traitement approprié
 */
export class ErrorDetector {
  private static readonly ERROR_FILTER_ENABLED = import.meta.env.VITE_ENABLE_ERROR_FILTERING === 'true';

  /**
   * Détecte si une erreur est liée au réseau
   */
  static isNetworkError(error: any): boolean {
    if (!error || !error.message) return false;
    
    const message = typeof error.message === 'string' 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
    
    return message.includes('network') || 
           message.includes('fetch') ||
           message.includes('connection') ||
           message.includes('cors') ||
           message.includes('failed to load') ||
           message.includes('timeout') ||
           message.includes('econnrefused') ||
           message.includes('socket');
  }

  /**
   * Détecte si une erreur est liée au chargement de modules
   */
  static isModuleLoadingError(error: any): boolean {
    if (!error || !error.message) return false;
    
    const message = typeof error.message === 'string' 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
    
    return message.includes('cannot access') ||
           message.includes('before initialization') ||
           message.includes('is not defined') ||
           message.includes('failed to load module') ||
           message.includes('unexpected token') ||
           message.includes('cannot find module');
  }

  /**
   * Détecte si une erreur est liée au rendu React
   */
  static isReactError(error: any): boolean {
    if (!error || !error.message) return false;
    
    const message = typeof error.message === 'string' 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
    
    return message.includes('react') ||
           message.includes('useeffect') ||
           message.includes('usestate') ||
           message.includes('uselayouteffect') ||
           message.includes('unstable_schedulecallback') ||
           message.includes('createelement') ||
           message.includes('invalid hook call') ||
           message.includes('cannot update a component') ||
           message.includes('maximum update depth exceeded');
  }

  /**
   * Détecte si une erreur est liée au chargement de ressources
   */
  static isResourceLoadingError(event: Event): boolean {
    if (!(event.target instanceof HTMLElement)) return false;
    
    const tagName = event.target.tagName.toLowerCase();
    return ['img', 'script', 'link', 'audio', 'video'].includes(tagName);
  }

  /**
   * Détecte le type d'erreur en fonction de ses caractéristiques
   */
  static detectErrorType(error: any): ErrorType {
    if (this.isNetworkError(error)) {
      return ErrorType.NETWORK;
    }
    
    if (this.isModuleLoadingError(error)) {
      return ErrorType.MODULE_LOADING;
    }
    
    if (this.isReactError(error)) {
      return ErrorType.REACT_RENDERING;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Filtre les erreurs non critiques si le filtrage est activé
   */
  static shouldProcessError(error: any, errorType: ErrorType): boolean {
    if (!this.ERROR_FILTER_ENABLED) return true;
    
    // Ignorer certaines erreurs non critiques
    if (errorType === ErrorType.NETWORK) {
      const message = String(error.message || error).toLowerCase();
      
      // Ignorer les requêtes annulées
      if (message.includes('aborted') || message.includes('canceled')) {
        return false;
      }
      
      // Ignorer les erreurs 404 pour les ressources non critiques
      if (message.includes('404') && message.includes('.png')) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Récupère les informations du navigateur pour le diagnostic
   */
  static getBrowserInfo(): BrowserInfo {
    // Récupération sécurisée des informations de connexion
    let connectionInfo: ConnectionInfo = {};
    
    // Vérifier si navigator.connection existe avant d'y accéder
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connectionInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
      
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform, 
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: connectionInfo
    };
  }

  /**
   * Traite une erreur globale et détermine la réponse appropriée
   */
  static processError(error: any): void {
    // Détection du type d'erreur
    const errorType = this.detectErrorType(error);
    
    // Vérifier si l'erreur doit être traitée
    if (!this.shouldProcessError(error, errorType)) {
      ErrorLogger.log(LogLevel.DEBUG, `Erreur filtrée de type ${errorType}`, error);
      return;
    }
    
    // Journalisation de l'erreur avec le niveau approprié
    const logLevel = errorType === ErrorType.MODULE_LOADING || 
                    errorType === ErrorType.REACT_RENDERING 
                      ? LogLevel.CRITICAL 
                      : LogLevel.ERROR;
    
    ErrorLogger.log(logLevel, `Erreur de type ${errorType} détectée`, error);
    
    // Actions spécifiques selon le type d'erreur
    switch (errorType) {
      case ErrorType.NETWORK:
        // Activer le mode hors ligne en cas d'erreur réseau
        console.warn('Problème de connexion détecté, activation du mode hors ligne...');
        if (APP_STATE && typeof APP_STATE.setOfflineMode === 'function') {
          APP_STATE.setOfflineMode(true);
        }
        break;
      
      case ErrorType.MODULE_LOADING:
        // Journal critique pour les erreurs de chargement de modules
        ErrorLogger.log(
          LogLevel.CRITICAL, 
          "ERREUR CRITIQUE: Problème de chargement de module détecté", 
          {
            message: error.message,
            location: error.filename || error.fileName,
            stackTrace: error.stack
          }
        );
        break;
      
      case ErrorType.REACT_RENDERING:
        // Activer le mode fallback pour les erreurs de rendu React
        console.warn('Erreur React critique détectée, mise en mode fallback...');
        ErrorLogger.log(
          LogLevel.CRITICAL, 
          "ERREUR CRITIQUE: Erreur de rendu React détectée", 
          error
        );
        APP_STATE.isOfflineMode = true;
        break;
    }
  }
}
