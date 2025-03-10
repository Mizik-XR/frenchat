
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { isNetlifyEnvironment, getEnvironmentInfo } from './utils/environment/environmentDetection';
import './index.css';

// Fonction de journalisation qui stocke aussi dans localStorage pour diagnostic
const logWithStorage = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
  
  console.log(logMessage);
  
  try {
    // Stocker dans localStorage pour diagnostic
    const logs = JSON.parse(localStorage.getItem('netlify_diagnostic_logs') || '[]');
    logs.push(logMessage);
    localStorage.setItem('netlify_diagnostic_logs', JSON.stringify(logs.slice(-100))); // Garder seulement les 100 derniers
  } catch (e) {
    console.warn('Impossible de stocker dans localStorage:', e);
  }
};

// Remplacer l'initialisation Sentry par des logs de diagnostic
logWithStorage('Initialisation de l\'application - Sentry désactivé temporairement');
logWithStorage('Environnement:', process.env.NODE_ENV);

// Ajouter des informations spécifiques pour Netlify
if (isNetlifyEnvironment()) {
  logWithStorage('Exécution sur Netlify:', window.location.hostname);
  logWithStorage('URL complète:', window.location.href);
  
  // Logs détaillés pour le débogage sur Netlify
  const envInfo = getEnvironmentInfo();
  logWithStorage('Informations détaillées sur l\'environnement Netlify:', envInfo);
}

// Fonction de diagnostic globale pour aider au débogage
window.showDiagnostic = function() {
  const diagnosticInfo = {
    environment: process.env.NODE_ENV,
    isNetlify: isNetlifyEnvironment(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  };
  
  logWithStorage('Diagnostic complet:', diagnosticInfo);
  return diagnosticInfo;
};

// Version simplifiée de initSentry pour préserver l'API
window.initSentry = function() {
  logWithStorage('Sentry initialisé en mode simulé (désactivé)');
  return true;
};

// Détection des paramètres d'URL pour le mode de fonctionnement
const urlParams = new URLSearchParams(window.location.search);
const forceCloud = urlParams.get('forceCloud') === 'true' || import.meta.env.VITE_CLOUD_MODE === 'true';
const debugMode = urlParams.get('debug') === 'true';
const isNetlify = isNetlifyEnvironment() || import.meta.env.VITE_NETLIFY_DEPLOYMENT === 'true';

// Configuration globale de l'application
window.APP_CONFIG = {
  forceCloudMode: forceCloud || isNetlify,
  debugMode: debugMode
};

if (forceCloud) {
  logWithStorage('Mode cloud forcé par paramètre d\'URL ou variable d\'environnement');
}

if (isNetlify) {
  logWithStorage('Mode Netlify détecté');
}

if (debugMode) {
  logWithStorage('Mode debug activé par paramètre d\'URL');
}

// Fonction pour afficher un message de chargement
const showLoadingMessage = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; text-align: center;">
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">Chargement en cours</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563;">
            L'application est en cours de chargement. Veuillez patienter...
          </p>
          <div style="width: 100%; height: 6px; background-color: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 1rem;">
            <div style="width: 30%; height: 100%; background-color: #4f46e5; border-radius: 3px; animation: progressAnimation 2s infinite ease-in-out;" id="loading-bar"></div>
          </div>
          <p style="font-size: 0.8rem; color: #6b7280;">
            Si le chargement prend trop de temps, essayez de rafraîchir la page.
          </p>
          <div style="margin-top: 1.5rem;">
            <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
              Rafraîchir
            </button>
            <button onclick="window.location.href='?forceCloud=true'" style="background-color: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
              Mode cloud
            </button>
            ${isNetlifyEnvironment() ? `
            <div style="margin-top: 1rem;">
              <a href="/diagnostic.html" style="color: #4f46e5; text-decoration: underline;">
                Diagnostic
              </a>
            </div>` : ''}
          </div>
        </div>
      </div>
      <style>
        @keyframes progressAnimation {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 10%; }
        }
      </style>
    `;
  }
};

// Fonction d'initialisation de l'application principale
const initializeApp = async () => {
  try {
    logWithStorage('Début du chargement dynamique de App');
    
    // Afficher un message de chargement
    showLoadingMessage();
    
    // 1. Charger le module App de façon dynamique
    const { default: App } = await import('./App');
    
    logWithStorage('Module App chargé avec succès');
    
    // 2. Rendre l'application
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error("Élément root non trouvé dans le DOM");
    }
    
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </React.StrictMode>
    );
    
    logWithStorage('Rendu React terminé');
    
  } catch (error: any) {
    logWithStorage('ERREUR CRITIQUE lors de l\'initialisation', {
      message: error.message,
      stack: error.stack,
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
          ${isNetlifyEnvironment() ? `
          <div style="margin-top: 1rem;">
            <a href="/diagnostic.html" 
               style="color: #3b82f6; text-decoration: underline;">
              Ouvrir la page de diagnostic
            </a>
          </div>` : ''}
        </div>
      `;
    }
    
    // Stocker l'erreur pour la diagnostiquer plus tard
    window.lastRenderError = error;
  }
};

// Initialiser l'application après un court délai (pour permettre aux gestionnaires d'erreur de s'initialiser)
setTimeout(initializeApp, 100);

// Déclaration du type global APP_CONFIG
declare global {
  interface Window {
    lastRenderError?: Error;
    showDiagnostic?: () => any;
    Sentry?: any;
    initSentry?: () => boolean;
    APP_CONFIG?: {
      forceCloudMode?: boolean;
      debugMode?: boolean;
    };
  }
}
