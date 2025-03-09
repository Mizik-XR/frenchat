
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { ErrorType, LogLevel } from "./types";

/**
 * Configuration et initialisation de Sentry pour le monitoring d'erreurs
 */
export class SentryMonitor {
  private static isInitialized = false;
  // DSN provenant du script Sentry de votre compte
  private static DSN = "https://9e087d2c1630c52d5873558bbdf14d51@o4506892579995648.ingest.sentry.io/4506892582484992";
  
  /**
   * Initialise Sentry avec la configuration adaptée à l'environnement
   */
  static initialize() {
    // Éviter la double initialisation
    if (this.isInitialized) return;
    
    try {
      // Initialiser Sentry uniquement si le DSN est défini et si nous ne sommes pas en mode développement local
      if (this.DSN && process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost') {
        console.log("Tentative d'initialisation de Sentry...");
        
        // Retarder l'initialisation de Sentry pour éviter les conflits avec React
        setTimeout(() => {
          try {
            // Configuration simplifiée mais robuste
            Sentry.init({
              dsn: this.DSN,
              integrations: [new BrowserTracing()],
              // Réduire le nombre d'événements envoyés en production
              tracesSampleRate: 0.1,
              environment: process.env.NODE_ENV || 'production',
              // Désactiver les fonctionnalités avancées pour éviter les conflits
              autoSessionTracking: false,
              release: import.meta.env.VITE_APP_VERSION || '1.0.0',
              // Filtrage des erreurs pour réduire le bruit
              beforeSend: (event) => {
                // Journaliser l'événement pour le débogage
                console.log("Événement Sentry préparé:", event.event_id);
                
                // Ignorer certaines erreurs non critiques ou connues
                if (event.exception && event.exception.values) {
                  const errorMessage = event.exception.values[0]?.value || '';
                  
                  // Liste des messages d'erreur à filtrer
                  const ignoredErrors = [
                    'ChunkLoadError',
                    'Loading CSS chunk',
                    'ResizeObserver',
                    'unstable_scheduleCallback',
                    'Cannot read properties of undefined',
                    'Network request failed',
                    'Failed to fetch',
                    'Mt',
                    'Tt'
                  ];
                  
                  // Vérifier si l'erreur doit être ignorée
                  if (ignoredErrors.some(msg => errorMessage.includes(msg))) {
                    console.log("Événement Sentry filtré:", errorMessage);
                    return null;
                  }
                }
                
                return event;
              }
            });
            
            this.isInitialized = true;
            console.log("Sentry monitoring initialized successfully");
          } catch (innerError) {
            console.error("Erreur pendant l'initialisation de Sentry:", innerError);
          }
        }, 3000); // Délai de 3 secondes pour éviter les conflits avec l'initialisation de React
      } else {
        console.warn("Sentry DSN not provided or development mode, monitoring disabled");
      }
    } catch (error) {
      console.error("Failed to initialize Sentry:", error);
    }
  }
  
  /**
   * Envoie une erreur à Sentry de manière sécurisée
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (!this.isInitialized) {
      console.error("Sentry not initialized, logging error locally:", error);
      return;
    }
    
    try {
      // Vérifier si l'erreur est du type à ignorer
      const errorMessage = error.message || '';
      const ignoredMessages = [
        'unstable_scheduleCallback',
        'ResizeObserver',
        'ChunkLoadError',
        'Mt',
        'Tt',
        'before initialization'
      ];
      
      if (ignoredMessages.some(msg => errorMessage.includes(msg))) {
        console.warn("Ignoré localement:", errorMessage);
        return;
      }
      
      Sentry.captureException(error, {
        extra: context
      });
    } catch (e) {
      // Échouer silencieusement pour éviter les boucles d'erreur
      console.error("Failed to send error to Sentry:", e);
    }
  }
  
  /**
   * Envoie un message à Sentry
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, any>) {
    if (!this.isInitialized) {
      console.log(`[${level}] ${message}`, context);
      return;
    }
    
    try {
      Sentry.captureMessage(message, {
        level,
        extra: context
      });
    } catch (e) {
      console.error("Failed to send message to Sentry:", e);
    }
  }
  
  /**
   * Traduit le niveau de log interne au niveau Sentry
   */
  static translateLogLevel(level: LogLevel): Sentry.SeverityLevel {
    switch (level) {
      case LogLevel.DEBUG: return "debug";
      case LogLevel.INFO: return "info";
      case LogLevel.WARN: return "warning";
      case LogLevel.ERROR: return "error";
      case LogLevel.CRITICAL: return "fatal";
      default: return "info";
    }
  }
  
  /**
   * Traduit le type d'erreur au format Sentry
   */
  static translateErrorType(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK: return "network";
      case ErrorType.MODULE_LOADING: return "module_loading";
      case ErrorType.REACT_RENDERING: return "react_rendering";
      case ErrorType.RESOURCE_LOADING: return "resource_loading";
      case ErrorType.PROMISE_REJECTION: return "promise_rejection";
      case ErrorType.API_ERROR: return "api_error";
      default: return "unknown";
    }
  }
  
  /**
   * Vérifie si Sentry est correctement initialisé
   */
  static isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Force la réinitialisation de Sentry (utile en cas de problème)
   */
  static forceReinit(): void {
    this.isInitialized = false;
    this.initialize();
  }
  
  /**
   * Test Sentry avec une erreur contrôlée
   */
  static testSentry(): void {
    try {
      throw new Error("Test Sentry Error - " + new Date().toISOString());
    } catch (error) {
      if (error instanceof Error) {
        console.log("Test d'erreur Sentry envoyé");
        this.captureException(error, { source: "testSentry", manual: true });
      }
    }
  }
}
