
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './index.css';
import * as Sentry from "@sentry/react";

// Configuration simplifiée de Sentry pour éviter les erreurs d'initialisation
Sentry.init({
  dsn: "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216",
  
  // Désactiver temporairement les intégrations qui causent des conflits
  integrations: [],
  
  // Performance Monitoring (simplifié)
  tracesSampleRate: 1.0,
  
  // Désactiver Session Replay temporairement
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,
  
  // Mode debug pour voir les problèmes d'initialisation
  debug: process.env.NODE_ENV !== 'production',
  
  // Ignorer les erreurs liées à l'initialisation
  ignoreErrors: [
    'unstable_scheduleCallback',
    'Cannot read properties of undefined',
    'Mt',
    'Tt'
  ]
});

// Configuration pour la journalisation
const isNetlify = window.location.hostname.includes('netlify.app');
const isDevMode = process.env.NODE_ENV === 'development';
const isCloudMode = import.meta.env.VITE_CLOUD_MODE === 'true';

// Fonction pour initialiser l'application de manière progressive
const initializeApp = async () => {
  try {
    console.log("Démarrage de l'initialisation progressive de l'application", {
      environment: process.env.NODE_ENV,
      isNetlify,
      isCloudMode,
      buildTime: import.meta.env.VITE_BUILD_TIME || 'non défini',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    });

    // Journalisation des informations du navigateur
    console.log("Informations du navigateur", {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine
    });

    // 1. Charger le module App de façon dynamique pour éviter les dépendances circulaires
    console.log("Chargement dynamique du module App...");
    const { default: App } = await import('./App');
    
    // 2. Rendre l'application
    console.log("Début du rendu de l'application");
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error("Élément root non trouvé dans le DOM");
    }
    
    const root = createRoot(rootElement);
    
    // Masquer l'écran de chargement initial
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Une fois que l'application est rendue, initialiser complètement Sentry
    try {
      // Réinitialiser Sentry avec toutes les intégrations après le rendu
      if (!isDevMode) {
        // Chargement différé des intégrations Sentry pour éviter les erreurs d'initialisation
        setTimeout(() => {
          try {
            import('@sentry/react').then(SentryModule => {
              const { browserTracingIntegration, replayIntegration } = SentryModule;
              
              // Réinitialiser Sentry avec toutes les intégrations
              Sentry.init({
                dsn: "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216",
                integrations: [
                  browserTracingIntegration(),
                  replayIntegration(),
                ],
                tracesSampleRate: 1.0,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
              });
              
              console.log("Sentry réinitialisé avec succès après le rendu de l'application");
            });
          } catch (e) {
            console.warn("Erreur lors de la réinitialisation de Sentry après le rendu:", e);
          }
        }, 2000);
      }
    } catch (sentryError) {
      console.warn("Erreur lors de la configuration de Sentry:", sentryError);
    }
    
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </React.StrictMode>
    );
    
    console.log("Rendu de l'application terminé avec succès");
    
  } catch (error) {
    console.error("ERREUR CRITIQUE lors de l'initialisation", {
      message: error.message,
      stack: error.stack
    });
    
    // Envoyer l'erreur à Sentry
    Sentry.captureException(error, {
      extra: { 
        location: "main.tsx initialization",
        critical: true
      }
    });
    
    // Afficher une interface utilisateur de secours en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #e11d48;">Problème de chargement</h2>
          <p>Une erreur est survenue lors du chargement de l'application.</p>
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; margin: 1rem 0;">
            ${error.message}
          </div>
          <div style="margin-top: 2rem;">
            <button onclick="window.location.reload()" 
                    style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; 
                           border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
              Recharger la page
            </button>
            <button onclick="window.location.href='?forceCloud=true'" 
                    style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; 
                           border-radius: 0.25rem; cursor: pointer;">
              Mode cloud
            </button>
          </div>
        </div>
      `;
    }
    
    // Stocker l'erreur pour la diagnostiquer plus tard
    window.lastRenderError = error;
  }
};

// Démarrer l'initialisation progressive
initializeApp();

// Créer une fonction de diagnostic pour Netlify
window.showNetlifyDiagnostic = function() {
  return {
    environment: {
      isNetlify,
      isDevMode,
      isCloudMode,
      buildTime: import.meta.env.VITE_BUILD_TIME || 'non défini',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine
    },
    sentry: {
      available: !!window.Sentry
    }
  };
};

// Exposer une fonction pour réinitialiser Sentry
window.initSentry = function() {
  try {
    import('@sentry/react').then(SentryModule => {
      const { browserTracingIntegration, replayIntegration } = SentryModule;
      
      Sentry.init({
        dsn: "https://7ec84a703e3dfd1a2fa5bed2ab4d00d4@o4508941853917184.ingest.de.sentry.io/4508949699035216",
        integrations: [
          browserTracingIntegration(),
          replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      
      console.log("Sentry réinitialisé manuellement avec succès");
      return true;
    });
  } catch (e) {
    console.error("Échec de la réinitialisation manuelle de Sentry:", e);
    return false;
  }
};

// Déclarer le type global
declare global {
  interface Window {
    lastRenderError?: Error;
    showNetlifyDiagnostic?: () => any;
    Sentry?: any;
    initSentry?: () => boolean;
  }
}
