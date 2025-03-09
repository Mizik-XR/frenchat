
import { useCallback } from 'react';
import * as Sentry from "@sentry/react";
import { LogLevel, ErrorType, SentryTypes } from "@/monitoring/types";
import { SentryMonitor } from "@/monitoring/sentry-integration";

export const useSentrySession = () => {
  const isSentryReady = useCallback((): boolean => {
    return typeof Sentry !== 'undefined' && typeof Sentry.captureException === 'function';
  }, []);

  const captureException = useCallback((error: Error, context?: Record<string, any>) => {
    if (!isSentryReady()) {
      console.warn("Sentry n'est pas initialisé, impossible de capturer l'exception", error);
      return;
    }
    
    try {
      Sentry.captureException(error, {
        extra: context
      });
      console.log("Erreur envoyée à Sentry:", error.message);
    } catch (e) {
      console.error("Échec de l'envoi d'erreur à Sentry:", e);
    }
  }, [isSentryReady]);

  const captureMessage = useCallback((message: string, level: string = "info", context?: Record<string, any>) => {
    if (!isSentryReady()) {
      console.warn("Sentry n'est pas initialisé, impossible de capturer le message", message);
      return;
    }
    
    try {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        extra: context
      });
    } catch (e) {
      console.error("Échec de l'envoi de message à Sentry:", e);
    }
  }, [isSentryReady]);

  const translateLogLevel = useCallback((level: LogLevel): SentryTypes.SeverityLevel => {
    // Use SentryMonitor's translation method
    return SentryMonitor.translateLogLevel(level) as SentryTypes.SeverityLevel;
  }, []);

  const translateErrorType = useCallback((type: ErrorType): string => {
    // Use SentryMonitor's translation method
    return SentryMonitor.translateErrorType(type as string);
  }, []);

  const testSentry = useCallback((): void => {
    if (!isSentryReady()) {
      console.warn("Sentry n'est pas initialisé, impossible d'exécuter le test");
      
      // Tenter d'initialiser Sentry via la fonction globale si disponible
      if (typeof window !== 'undefined' && window.initSentry) {
        window.initSentry();
        console.log("Tentative de réinitialisation de Sentry via window.initSentry");
        return;
      }
      
      return;
    }
    
    try {
      throw new Error("Test Sentry Error - " + new Date().toISOString());
    } catch (error) {
      if (error instanceof Error) {
        console.log("Test d'erreur Sentry envoyé");
        captureException(error, { source: "useSentrySession", manual: true });
      }
    }
  }, [isSentryReady, captureException]);

  const setUserContext = useCallback((userId: string, email?: string, username?: string) => {
    if (!isSentryReady()) {
      console.warn("Sentry n'est pas initialisé, impossible de définir le contexte utilisateur");
      return;
    }
    
    try {
      Sentry.setUser({
        id: userId,
        email,
        username
      });
    } catch (e) {
      console.error("Échec de la définition du contexte utilisateur Sentry:", e);
    }
  }, [isSentryReady]);

  const clearUserContext = useCallback(() => {
    if (!isSentryReady()) {
      console.warn("Sentry n'est pas initialisé, impossible d'effacer le contexte utilisateur");
      return;
    }
    
    try {
      Sentry.setUser(null);
    } catch (e) {
      console.error("Échec de l'effacement du contexte utilisateur Sentry:", e);
    }
  }, [isSentryReady]);

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
