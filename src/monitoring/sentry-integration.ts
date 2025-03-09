
import { ErrorType, LogLevel } from "./types";
import * as Sentry from "@sentry/react";

/**
 * Interface avec Sentry pour le monitoring d'erreurs
 * Utilise l'intégration directe avec le SDK Sentry React
 */
export class SentryMonitor {
  private static isInitialized = false;
  
  // Mise à jour de la clé DSN avec celle fournie par Sentry
  static DSN = "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216";
  
  /**
   * Vérifie si Sentry est déjà initialisé
   */
  static initialize() {
    try {
      // Si nous sommes en développement ou sur localhost, ne pas initialiser Sentry
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.warn("Sentry désactivé en mode développement ou sur localhost");
        return false;
      }
      
      // Vérifier si Sentry est déjà disponible
      if (Sentry && typeof Sentry.captureException === 'function') {
        console.log("SDK Sentry disponible et initialisé");
        this.isInitialized = true;
        return true;
      }
      
      console.warn("SDK Sentry n'est pas initialisé correctement");
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de Sentry:", error);
      return false;
    }
  }
  
  /**
   * Envoie une erreur à Sentry de manière sécurisée
   */
  static captureException(error: Error, context?: Record<string, any>) {
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
        console.warn("Erreur ignorée localement:", errorMessage);
        return;
      }
      
      // Utiliser le SDK Sentry pour capturer l'exception
      Sentry.captureException(error, {
        extra: context
      });
      
      console.log("Erreur envoyée à Sentry:", error.message);
    } catch (e) {
      // Échouer silencieusement pour éviter les boucles d'erreur
      console.error("Échec de l'envoi d'erreur à Sentry:", e);
    }
  }
  
  /**
   * Envoie un message à Sentry
   */
  static captureMessage(message: string, level: string = "info", context?: Record<string, any>) {
    try {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        extra: context
      });
    } catch (e) {
      console.error("Échec de l'envoi de message à Sentry:", e);
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
    return Sentry && typeof Sentry.captureException === 'function';
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

// Ajouter la déclaration pour les types Sentry
declare global {
  namespace Sentry {
    type SeverityLevel = "fatal" | "error" | "warning" | "info" | "debug";
  }
}
