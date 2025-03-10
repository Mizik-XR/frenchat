
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './index.css';
import AppMinimal from './AppMinimal';

// Polyfills pour les fonctions React manquantes
window.unstable_scheduleCallback = window.unstable_scheduleCallback || function() {
  console.log('[Polyfill] unstable_scheduleCallback appelé');
  return null;
};

window.unstable_cancelCallback = window.unstable_cancelCallback || function() {
  console.log('[Polyfill] unstable_cancelCallback appelé');
  return null;
};

// Système de journalisation simplifié
const logger = {
  log: function(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn: function(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: function(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data || '');
  }
};

// Démarrage de l'application
logger.log('Démarrage de l\'application minimale');

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  // Ignorer certaines erreurs connues
  if (typeof message === 'string' && (
    message.includes('unstable_scheduleCallback') ||
    message.includes('Sentry') ||
    message.includes('before initialization')
  )) {
    logger.warn('Erreur non critique ignorée:', message);
    return true; // Empêcher la propagation
  }
  
  logger.error('Erreur globale:', { message, source, lineno, colno });
  return false;
};

// Fonction d'initialisation simplifiée
const initializeMinimalApp = () => {
  try {
    logger.log('Initialisation de l\'application minimale');
    
    // Sélection du point de montage
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Élément root non trouvé");
    }
    
    // Création du root React
    const root = createRoot(rootElement);
    
    // Rendu avec un minimum de providers
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <AppMinimal />
          <Toaster />
        </ThemeProvider>
      </React.StrictMode>
    );
    
    logger.log('Application minimale rendue avec succès');
    
  } catch (error) {
    logger.error('Erreur critique lors de l\'initialisation', error);
    
    // Interface de secours en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #e11d48;">Problème de chargement</h2>
          <p>Une erreur est survenue lors du chargement de l'application minimale.</p>
          <pre style="text-align: left; background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow: auto; margin-top: 1rem;">
            ${error instanceof Error ? error.message : String(error)}
          </pre>
          <div style="margin-top: 2rem;">
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
              Recharger la page
            </button>
            <a href="/diagnostic.html" style="display: block; margin-top: 1rem; color: #3b82f6;">
              Diagnostic
            </a>
          </div>
        </div>
      `;
      
      // Stocker l'erreur pour diagnostic
      window.lastRenderError = error;
    }
  }
};

// Initialiser l'application après un court délai
setTimeout(initializeMinimalApp, 100);

// Types globaux
declare global {
  interface Window {
    lastRenderError?: Error;
    unstable_scheduleCallback?: any;
    unstable_cancelCallback?: any;
  }
}
