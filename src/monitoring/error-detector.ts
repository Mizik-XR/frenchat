
import { LogLevel, ErrorType, BrowserInfo, ConnectionInfo } from './types';
import { ErrorLogger } from './logger';

/**
 * Service de détection et d'analyse des erreurs
 * Identifie les types d'erreurs et suggère des actions correctives
 */
export class ErrorDetector {
  /**
   * Détecte le type d'erreur à partir de son message et sa stack trace
   */
  static detectErrorType(error: Error): ErrorType {
    const message = error.message || '';
    const stack = error.stack || '';
    
    if (this.isNetworkError(error)) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('Loading chunk') || message.includes('Loading CSS chunk') || message.includes('script error')) {
      return ErrorType.RESOURCE_LOADING;
    }
    
    if (message.includes('Cannot access') || message.includes('before initialization') || stack.includes('webpack')) {
      return ErrorType.MODULE_LOADING;
    }
    
    if (message.includes('React') || message.includes('useEffect') || message.includes('useState') || 
        message.includes('hook') || stack.includes('react-dom')) {
      return ErrorType.REACT_RENDERING;
    }
    
    if (message.includes('promise') || message.includes('then') || message.includes('async')) {
      return ErrorType.PROMISE_REJECTION;
    }
    
    if (message.includes('API') || message.includes('fetch') || message.includes('request') || 
        message.includes('response') || message.includes('status code')) {
      return ErrorType.API_ERROR;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Vérifie si une erreur est liée au réseau
   */
  static isNetworkError(error: Error | any): boolean {
    const message = typeof error === 'string' ? error : error?.message || '';
    
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('Network') || 
           message.includes('ECONNREFUSED') || 
           message.includes('Failed to fetch') || 
           message.includes('ERR_CONNECTION') || 
           message.includes('ERR_INTERNET_DISCONNECTED');
  }

  /**
   * Vérifie si une erreur concerne le chargement d'une ressource externe
   */
  static isResourceLoadingError(event: Event): boolean {
    const target = event.target as HTMLElement;
    if (!target) return false;
    
    const tagName = target.tagName?.toLowerCase();
    return tagName === 'link' || tagName === 'script' || tagName === 'img' || tagName === 'video' || tagName === 'audio';
  }

  /**
   * Traite une erreur détectée et prend des mesures correctives si possible
   */
  static processError(error: Error): void {
    const errorType = this.detectErrorType(error);
    
    // Journaliser l'erreur avec son type
    ErrorLogger.log(LogLevel.ERROR, `Erreur détectée de type: ${errorType}`, { 
      errorType, 
      message: error.message, 
      stack: error.stack 
    });
    
    // Actions spécifiques selon le type d'erreur
    switch (errorType) {
      case ErrorType.NETWORK:
        // Vérifier la connectivité et potentiellement activer le mode hors ligne
        this.checkConnectivity();
        break;
        
      case ErrorType.RESOURCE_LOADING:
        // Tenter de recharger la ressource ou suggérer un rafraîchissement de la page
        this.suggestPageRefresh();
        break;
        
      case ErrorType.MODULE_LOADING:
        // Erreur critique de chargement de module - suggérer un hard refresh
        this.suggestCacheClearing();
        break;
        
      default:
        // Pas d'action spécifique pour les autres types d'erreurs
        break;
    }
  }

  /**
   * Vérifie l'état de la connexion Internet
   */
  private static checkConnectivity(): boolean {
    const isOnline = navigator.onLine;
    ErrorLogger.log(LogLevel.INFO, `État de la connexion: ${isOnline ? 'en ligne' : 'hors ligne'}`);
    return isOnline;
  }

  /**
   * Suggère un rafraîchissement de la page
   */
  private static suggestPageRefresh(): void {
    console.info('Rafraîchissement de la page recommandé pour résoudre le problème de chargement de ressource');
  }

  /**
   * Suggère un nettoyage du cache
   */
  private static suggestCacheClearing(): void {
    console.warn('Problème de chargement de module. Essayez de vider le cache et les cookies, puis rechargez la page');
  }

  /**
   * Récupère les informations de l'environnement du navigateur
   */
  static getBrowserInfo(): BrowserInfo {
    // Récupération sécurisée des informations de connexion
    let connectionInfo: ConnectionInfo = {};
    
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
}
