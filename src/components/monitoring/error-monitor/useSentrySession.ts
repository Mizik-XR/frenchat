
import { useCallback } from 'react';
import { LogLevel, ErrorType, SentryTypes } from "@/monitoring/types";
import { SentryMonitor } from "@/monitoring/sentry-integration";

/**
 * Version simplifiée du hook useSentrySession qui utilise des console.log
 * au lieu d'envoyer des données à Sentry
 */
export const useSentrySession = () => {
  // Vérifie si Sentry est prêt (toujours retourne false dans cette version simplifiée)
  const isSentryReady = useCallback((): boolean => {
    console.log('🔍 Vérification de Sentry (désactivé)');
    // Version simplifiée pour le débogage - toujours retourner false
    return false;
  }, []);

  // Capture une exception (utilise console.error à la place)
  const captureException = useCallback((error: Error, context?: Record<string, any>) => {
    console.error('🐞 Exception simulée (Sentry désactivé):', error.message, {
      stack: error.stack,
      context
    });
  }, []);

  // Capture un message (utilise console.log à la place)
  const captureMessage = useCallback((message: string, level: string = "info", context?: Record<string, any>) => {
    const prefix = level === 'error' ? '❌' : 
                  level === 'warning' ? '⚠️' : 
                  level === 'info' ? 'ℹ️' : '📝';
    
    console.log(`${prefix} Message simulé (Sentry désactivé) [${level}]:`, message, context || '');
  }, []);

  // Utilise les méthodes de traduction du SentryMonitor
  const translateLogLevel = useCallback((level: LogLevel): SentryTypes.SeverityLevel => {
    return SentryMonitor.translateLogLevel(level) as SentryTypes.SeverityLevel;
  }, []);

  const translateErrorType = useCallback((type: ErrorType): string => {
    return SentryMonitor.translateErrorType(type as string);
  }, []);

  // Test de Sentry (utilise console.log à la place)
  const testSentry = useCallback((): void => {
    console.log('🧪 Test Sentry simulé (Sentry désactivé)');
    try {
      throw new Error("Test Sentry Error - " + new Date().toISOString());
    } catch (error) {
      if (error instanceof Error) {
        console.log("Test d'erreur Sentry simulé:", error.message);
      }
    }
  }, []);

  // Définir le contexte utilisateur (utilise console.log à la place)
  const setUserContext = useCallback((userId: string, email?: string, username?: string) => {
    console.log('👤 Contexte utilisateur simulé (Sentry désactivé):', { userId, email, username });
  }, []);

  // Effacer le contexte utilisateur (utilise console.log à la place)
  const clearUserContext = useCallback(() => {
    console.log('🧹 Contexte utilisateur effacé (simulé, Sentry désactivé)');
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
