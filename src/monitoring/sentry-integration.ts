
import * as Sentry from '@sentry/react';

export class SentryMonitor {
  // Propriété statique pour stocker le DSN
  static DSN = "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216";
  static initialized = false;

  /**
   * Vérifie si Sentry est correctement initialisé et prêt à l'emploi
   * Dans cette version simplifiée, retourne toujours false
   */
  static isReady(): boolean {
    console.log('🔍 Vérification de Sentry (version simplifiée - désactivé)');
    return false; // Toujours désactivé dans cette version de débogage
  }

  /**
   * Version simplifiée de l'initialisation qui ne fait rien
   * sauf journaliser l'appel
   */
  static initialize(): void {
    console.log('🔧 Tentative d\'initialisation de Sentry (désactivée pour le débogage)');
    this.initialized = false; // Toujours désactivé
  }

  /**
   * Capture une exception et l'envoie à Sentry (simulé)
   */
  static captureException(error: Error, context?: Record<string, any>): void {
    console.error('🐞 Erreur capturée (Sentry désactivé):', error.message, {
      stack: error.stack,
      context: context || {}
    });
  }

  /**
   * Capture un message et l'envoie à Sentry (simulé)
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
    const prefix = level === 'error' ? '❌' : 
                  level === 'warning' ? '⚠️' : 
                  level === 'info' ? 'ℹ️' : '📝';
    
    console.log(`${prefix} Message capturé (Sentry désactivé) [${level}]:`, message, context || '');
  }

  /**
   * Configure le contexte utilisateur pour Sentry (simulé)
   */
  static setUser(userId: string, email?: string, username?: string): void {
    console.log('👤 Utilisateur défini (Sentry désactivé):', { userId, email, username });
  }

  /**
   * Efface le contexte utilisateur (simulé)
   */
  static clearUser(): void {
    console.log('🧹 Contexte utilisateur effacé (Sentry désactivé)');
  }

  /**
   * Test de connectivité Sentry (simulé)
   */
  static testConnection(): boolean {
    console.log('🧪 Test de connexion Sentry (simulé, désactivé)');
    return false;
  }

  /**
   * Convertit les niveaux de log internes en niveaux Sentry
   */
  static translateLogLevel(level: string): Sentry.SeverityLevel {
    switch (level) {
      case 'DEBUG': return 'debug';
      case 'INFO': return 'info';
      case 'WARN': return 'warning';
      case 'ERROR': return 'error';
      case 'CRITICAL': return 'fatal';
      default: return 'info';
    }
  }

  /**
   * Traduit les types d'erreur internes en types Sentry
   */
  static translateErrorType(type: string): string {
    switch (type) {
      case 'NETWORK': return 'network';
      case 'MODULE_LOADING': return 'module_loading';
      case 'REACT_RENDERING': return 'react_rendering';
      case 'RESOURCE_LOADING': return 'resource_loading';
      case 'PROMISE_REJECTION': return 'promise_rejection';
      case 'API_ERROR': return 'api_error';
      default: return 'unknown';
    }
  }
}

// Ne pas initialiser Sentry automatiquement dans cette version simplifiée
console.log('⚠️ Sentry automatiquement désactivé pour le débogage');
