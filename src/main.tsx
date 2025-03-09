
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

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
    
    // 2. Initialiser les moniteurs d'erreur seulement si nécessaire et de façon asynchrone
    console.log("Chargement des moniteurs d'erreur...");
    let ReactErrorMonitor = null;
    let SentryMonitor = null;
    
    if (!isDevMode) {
      try {
        // Importer de façon dynamique pour éviter les problèmes d'initialisation
        const monitoring = await import('./monitoring/index');
        ReactErrorMonitor = monitoring.ReactErrorMonitor;
        SentryMonitor = monitoring.SentryMonitor;
        
        // Initialiser Sentry uniquement en production et si disponible
        if (SentryMonitor) {
          console.log("Initialisation de Sentry...");
          SentryMonitor.initialize();
        }
      } catch (monitoringError) {
        console.warn("Erreur lors du chargement des moniteurs:", monitoringError);
        // Continuer sans monitoring plutôt que de bloquer l'application
      }
    }

    // 3. Rendre l'application
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
    
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          {ReactErrorMonitor && <ReactErrorMonitor />}
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
    }
  };
};

// Déclarer le type global
declare global {
  interface Window {
    lastRenderError?: Error;
    showNetlifyDiagnostic?: () => any;
  }
}
