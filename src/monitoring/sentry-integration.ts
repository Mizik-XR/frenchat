
import * as Sentry from "@sentry/react";
import { ErrorType, LogLevel } from "./types";
import { ErrorLogger } from "./logger";

/**
 * Configuration et initialisation de Sentry pour le monitoring d'erreurs
 */
export class SentryMonitor {
  private static isInitialized = false;
  private static DSN = "https://js-de.sentry-cdn.com/9e087d2c1630c52d5873558bbdf14d51.min.js";
  
  /**
   * Initialise Sentry avec la configuration adaptée à l'environnement
   */
  static initialize() {
    // Éviter la double initialisation
    if (this.isInitialized) return;
    
    try {
      // Initialiser Sentry uniquement si le DSN est défini
      if (this.DSN) {
        Sentry.init({
          dsn: this.DSN,
          integrations: [new Sentry.BrowserTracing()],
          tracesSampleRate: 0.1, // Capture 10% des transactions
          environment: import.meta.env.MODE || 'production',
          
          // Filtrer certaines erreurs avant envoi
          beforeSend(event) {
            // Ne pas envoyer certaines erreurs courantes en développement
            if (import.meta.env.DEV) {
              if (event.exception?.values?.some(ex => 
                ex.value?.includes('ResizeObserver') ||
                ex.value?.includes('Network Error')
              )) {
                return null;
              }
            }
            
            return event;
          }
        });
        
        this.isInitialized = true;
        ErrorLogger.log(LogLevel.INFO, "Sentry monitoring initialized");
      } else {
        ErrorLogger.log(LogLevel.WARN, "Sentry DSN not provided, monitoring disabled");
      }
    } catch (error) {
      ErrorLogger.log(LogLevel.ERROR, "Failed to initialize Sentry", { error });
      console.error("Failed to initialize Sentry:", error);
    }
  }
  
  /**
   * Envoie une erreur à Sentry
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (!this.isInitialized) return;
    
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
    if (!this.isInitialized) return;
    
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
