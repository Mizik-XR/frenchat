
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { ErrorType, LogLevel } from "./types";
import { ErrorLogger } from "./logger";

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
      // Initialiser Sentry uniquement si le DSN est défini
      if (this.DSN) {
        console.log("Tentative d'initialisation de Sentry...");
        
        // Initialiser avec une configuration simplifiée et sécurisée
        Sentry.init({
          dsn: this.DSN,
          integrations: [new BrowserTracing()],
          tracesSampleRate: 0.1,
          environment: process.env.NODE_ENV || 'production',
          // Désactiver temporairement certaines fonctionnalités avancées
          autoSessionTracking: false,
          release: import.meta.env.VITE_APP_VERSION || '1.0.0',
          // Mode débogage pour plus d'informations dans la console
          debug: process.env.NODE_ENV === 'development',
          // Contrôle des événements envoyés à Sentry
          beforeSend: (event) => {
            // Journaliser l'événement pour le débogage
            console.log("Événement Sentry prêt à être envoyé:", event.event_id);
            // Filtrer certains types d'erreurs pour réduire le bruit
            if (event.exception && event.exception.values) {
              const errorMessage = event.exception.values[0]?.value || '';
              if (errorMessage.includes('ChunkLoadError') || 
                  errorMessage.includes('Loading CSS chunk') ||
                  errorMessage.includes('ResizeObserver')) {
                console.log("Événement Sentry filtré:", errorMessage);
                return null;
              }
            }
            return event;
          }
        });
        
        this.isInitialized = true;
        console.log("Sentry monitoring initialized");
      } else {
        console.warn("Sentry DSN not provided, monitoring disabled");
      }
    } catch (error) {
      console.error("Failed to initialize Sentry:", error);
    }
  }
  
  /**
   * Envoie une erreur à Sentry
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (!this.isInitialized) {
      console.error("Sentry not initialized, logging error locally:", error);
      return;
    }
    
    try {
      Sentry.captureException(error, {
        extra: context
      });
    } catch (e) {
      // Fail silently to avoid error loops
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
}
