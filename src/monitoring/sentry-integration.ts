import * as Sentry from '@sentry/react';

export class SentryMonitor {
  // Propriété statique pour stocker le DSN
  static DSN = "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216";
  static initialized = false;

  /**
   * Vérifie si Sentry est correctement initialisé et prêt à l'emploi
   */
  static isReady(): boolean {
    if (process.env.NODE_ENV === 'development') {
      return false; // Désactiver en développement par défaut
    }
    
    try {
      return typeof Sentry !== 'undefined' && 
             typeof Sentry.captureException === 'function' &&
             this.initialized;
    } catch (e) {
      console.warn("Erreur lors de la vérification de Sentry:", e);
      return false;
    }
  }

  /**
   * Initialise Sentry avec la configuration de base
   */
  static initialize(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry désactivé en environnement de développement');
      return;
    }

    try {
      if (this.isReady()) {
        console.log('Sentry déjà initialisé');
        return;
      }

      // Importation dynamique des intégrations
      import('@sentry/react').then(SentryModule => {
        const { browserTracingIntegration, replayIntegration } = SentryModule;
        
        Sentry.init({
          dsn: this.DSN,
          integrations: [
            browserTracingIntegration(),
            replayIntegration(),
          ],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          environment: import.meta.env.MODE || 'production',
        });
        
        this.initialized = true;
        console.log('Sentry initialisé avec succès');
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Sentry:', error);
    }
  }

  /**
   * Capture une exception et l'envoie à Sentry
   */
  static captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isReady()) {
      console.warn('Sentry n\'est pas initialisé, erreur non capturée:', error);
      return;
    }

    try {
      Sentry.captureException(error, {
        extra: context
      });
    } catch (e) {
      console.error('Erreur lors de la capture d\'exception:', e);
    }
  }

  /**
   * Capture un message et l'envoie à Sentry
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
    if (!this.isReady()) {
      console.warn('Sentry n\'est pas initialisé, message non capturé:', message);
      return;
    }

    try {
      Sentry.captureMessage(message, {
        level,
        extra: context
      });
    } catch (e) {
      console.error('Erreur lors de la capture de message:', e);
    }
  }

  /**
   * Configure le contexte utilisateur pour Sentry
   */
  static setUser(userId: string, email?: string, username?: string): void {
    if (!this.isReady()) {
      console.warn('Sentry n\'est pas initialisé, contexte utilisateur non défini');
      return;
    }

    try {
      Sentry.setUser({
        id: userId,
        email,
        username
      });
    } catch (e) {
      console.error('Erreur lors de la définition du contexte utilisateur:', e);
    }
  }

  /**
   * Efface le contexte utilisateur
   */
  static clearUser(): void {
    if (!this.isReady()) {
      return;
    }

    try {
      Sentry.setUser(null);
    } catch (e) {
      console.error('Erreur lors de l\'effacement du contexte utilisateur:', e);
    }
  }

  /**
   * Test de connectivité Sentry
   */
  static testConnection(): boolean {
    if (!this.isReady()) {
      console.warn('Sentry n\'est pas initialisé, test impossible');
      return false;
    }

    try {
      const testError = new Error('Test Sentry Connection - ' + new Date().toISOString());
      this.captureException(testError, { source: 'test', manual: true });
      return true;
    } catch (e) {
      console.error('Échec du test de connexion Sentry:', e);
      return false;
    }
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

// Initialiser Sentry uniquement en production
if (process.env.NODE_ENV === 'production') {
  try {
    SentryMonitor.initialize();
  } catch (e) {
    console.error('Erreur lors de l\'initialisation automatique de Sentry:', e);
  }
}
