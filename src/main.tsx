
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

// Polyfill pour les fonctions React manquantes
// Ces fonctions sont requises par certaines versions de React mais peuvent être absentes
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
logger.log('Démarrage de l\'application');
logger.log('Environnement:', { mode: process.env.NODE_ENV });

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

// Fonction d'initialisation ultra-simplifiée
const initializeApp = () => {
  try {
    logger.log('Initialisation de l\'application simplifiée');
    
    // Sélection du point de montage
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Élément root non trouvé");
    }
    
    // Importation synchrone de App pour éviter les erreurs asynchrones
    import('./App').then((module) => {
      const App = module.default;
      const root = createRoot(rootElement);
      
      // Rendu avec un minimum de providers
      root.render(
        <React.StrictMode>
          <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <App />
            <Toaster />
          </ThemeProvider>
        </React.StrictMode>
      );
      
      logger.log('Application rendue avec succès');
    }).catch(error => {
      logger.error('Erreur lors du chargement de App', error);
      showFallbackUI(rootElement, error);
    });
    
  } catch (error) {
    logger.error('Erreur critique lors de l\'initialisation', error);
    
    // Interface de secours en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
      showFallbackUI(rootElement, error);
    }
  }
};

// Fonction pour afficher l'UI de secours
const showFallbackUI = (rootElement: HTMLElement, error: unknown) => {
  rootElement.innerHTML = `
    <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
      <h2 style="color: #e11d48;">Problème de chargement</h2>
      <p>Une erreur est survenue lors du chargement de l'application.</p>
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
        <a href="/diagnostic.html" 
           style="display: block; margin-top: 1rem; color: #3b82f6;">
          Diagnostic
        </a>
        <a href="/minimal.html" 
           style="display: block; margin-top: 0.5rem; color: #3b82f6;">
          Version minimale
        </a>
      </div>
    </div>
  `;
  
  // Stocker l'erreur pour diagnostic
  window.lastRenderError = error as Error;
};

// Initialiser l'application après un court délai
setTimeout(initializeApp, 100);

// Types globaux
declare global {
  interface Window {
    lastRenderError?: Error;
    unstable_scheduleCallback?: any;
    unstable_cancelCallback?: any;
  }
}
