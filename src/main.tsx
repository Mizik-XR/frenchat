
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { isNetlifyEnvironment, getEnvironmentInfo } from './utils/environment/environmentDetection';
import './index.css';

// Système de journalisation simplifié
const logger = {
  log: function(message, data) {
    console.log(`[INFO] ${message}`, data || '');
    return true;
  },
  warn: function(message, data) {
    console.warn(`[WARN] ${message}`, data || '');
    return true;
  },
  error: function(message, data) {
    console.error(`[ERROR] ${message}`, data || '');
    return true;
  }
};

// Détection de l'environnement
logger.log('Démarrage de l\'application');
logger.log('Environnement:', { mode: process.env.NODE_ENV });

// Informations pour Netlify
if (isNetlifyEnvironment()) {
  logger.log('Environnement Netlify détecté');
}

// Fonction de diagnostic globale
window.showDiagnostic = function() {
  const info = {
    environment: process.env.NODE_ENV,
    isNetlify: isNetlifyEnvironment(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  logger.log('Diagnostic', info);
  return info;
};

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  // Ignorer certaines erreurs connues
  if (message && (
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

// Fonction d'initialisation de l'application simplifiée
const initializeApp = async () => {
  try {
    logger.log('Chargement du module App');
    
    // Charger le module App de façon dynamique
    const App = (await import('./App')).default;
    logger.log('Module App chargé');
    
    // Préparer le rendu
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Élément root non trouvé");
    }
    
    const root = createRoot(rootElement);
    
    // Rendu avec moins de niveaux d'imbrication
    root.render(
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    );
    
    logger.log('Application rendue');
    
  } catch (error) {
    logger.error('Erreur critique lors de l\'initialisation', error);
    
    // Interface de secours en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
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
          </div>
        </div>
      `;
    }
    
    // Stocker l'erreur pour diagnostic
    window.lastRenderError = error;
  }
};

// Initialiser l'application après un court délai pour laisser le DOM se stabiliser
setTimeout(initializeApp, 100);

// Types globaux
declare global {
  interface Window {
    lastRenderError?: Error;
    showDiagnostic?: () => any;
    Sentry?: any;
  }
}
