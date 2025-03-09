
/**
 * Hook pour la gestion de session Sentry
 * Fournit des fonctions pour initialiser Sentry, capturer des erreurs et des messages
 */
import { useEffect, useCallback } from 'react';
import * as Sentry from "@sentry/react";
import { LogLevel, ErrorType, SentryTypes } from "@/monitoring/types";

export const useSentrySession = () => {
  /**
   * Capture une exception et l'envoie à Sentry
   */
  const captureException = useCallback((error: Error, context?: Record<string, any>) => {
    try {
      // Utiliser le SDK Sentry pour capturer l'exception
      Sentry.captureException(error, {
        extra: context
      });
      
      console.log("Erreur envoyée à Sentry:", error.message);
    } catch (e) {
      // Échouer silencieusement pour éviter les boucles d'erreur
      console.error("Échec de l'envoi d'erreur à Sentry:", e);
    }
  }, []);
  
  /**
   * Capture un message et l'envoie à Sentry
   */
  const captureMessage = useCallback((message: string, level: string = "info", context?: Record<string, any>) => {
    try {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        extra: context
      });
    } catch (e) {
      console.error("Échec de l'envoi de message à Sentry:", e);
    }
  }, []);
  
  /**
   * Vérifie si Sentry est correctement initialisé
   */
  const isSentryReady = useCallback((): boolean => {
    return Sentry && typeof Sentry.captureException === 'function';
  }, []);
  
  /**
   * Traduit le niveau de log interne au niveau Sentry
   */
  const translateLogLevel = useCallback((level: LogLevel): SentryTypes.SeverityLevel => {
    switch (level) {
      case LogLevel.DEBUG: return "debug";
      case LogLevel.INFO: return "info";
      case LogLevel.WARN: return "warning";
      case LogLevel.ERROR: return "error";
      case LogLevel.CRITICAL: return "fatal";
      default: return "info";
    }
  }, []);
  
  /**
   * Traduit le type d'erreur au format Sentry
   */
  const translateErrorType = useCallback((type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK: return "network";
      case ErrorType.MODULE_LOADING: return "module_loading";
      case ErrorType.REACT_RENDERING: return "react_rendering";
      case ErrorType.RESOURCE_LOADING: return "resource_loading";
      case ErrorType.PROMISE_REJECTION: return "promise_rejection";
      case ErrorType.API_ERROR: return "api_error";
      default: return "unknown";
    }
  }, []);
  
  /**
   * Teste Sentry avec une erreur contrôlée
   */
  const testSentry = useCallback((): void => {
    try {
      throw new Error("Test Sentry Error - " + new Date().toISOString());
    } catch (error) {
      if (error instanceof Error) {
        console.log("Test d'erreur Sentry envoyé");
        captureException(error, { source: "useSentrySession", manual: true });
      }
    }
  }, [captureException]);
  
  /**
   * Définit le contexte utilisateur pour la session Sentry
   */
  const setUserContext = useCallback((userId: string, email?: string, username?: string) => {
    try {
      Sentry.setUser({
        id: userId,
        email,
        username
      });
    } catch (e) {
      console.error("Échec de la définition du contexte utilisateur Sentry:", e);
    }
  }, []);
  
  /**
   * Efface le contexte utilisateur de la session Sentry
   */
  const clearUserContext = useCallback(() => {
    try {
      Sentry.setUser(null);
    } catch (e) {
      console.error("Échec de l'effacement du contexte utilisateur Sentry:", e);
    }
  }, []);
  
  return {
    captureException,
    captureMessage,
    isSentryReady,
    translateLogLevel,
    translateErrorType,
    testSentry,
    setUserContext,
    clearUserContext
  };
};
