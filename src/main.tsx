
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { ReactErrorMonitor } from '@/components/monitoring/ReactErrorMonitor';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

// Configuration pour la journalisation
const STARTUP_LOG = [];
const isNetlify = window.location.hostname.includes('netlify.app');
const isDevMode = process.env.NODE_ENV === 'development';
const isCloudMode = import.meta.env.VITE_CLOUD_MODE === 'true';

// Fonction de journalisation
function logStartup(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [STARTUP] ${message}`;
  console.log(logMessage);
  
  // Ajouter au journal de démarrage
  STARTUP_LOG.push(logMessage);
  
  // Si des données sont fournies, les ajouter également
  if (data) {
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    STARTUP_LOG.push(`[DATA] ${dataString}`);
  }

  // Stocker dans localStorage pour récupération ultérieure
  try {
    localStorage.setItem('filechat_startup_log', JSON.stringify(STARTUP_LOG.slice(-100)));
  } catch (e) {
    console.warn("Impossible de stocker les journaux dans localStorage", e);
  }
}

// Journal des informations de l'environnement
logStartup("Initialisation de l'application", {
  environment: process.env.NODE_ENV,
  isNetlify,
  isCloudMode,
  buildTime: import.meta.env.VITE_BUILD_TIME || 'non défini',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
});

// Journalisation des informations du navigateur
logStartup("Informations du navigateur", {
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  online: navigator.onLine
});

// Gestionnaire d'erreurs pour les problèmes de chargement
window.addEventListener('error', (event) => {
  // Détecter les erreurs de chargement de modules
  if (event.message && (
    event.message.includes('Cannot access') ||
    event.message.includes('before initialization') ||
    event.message.includes('is not defined') ||
    event.message.includes('Failed to load module')
  )) {
    logStartup("ERREUR DE CHARGEMENT DE MODULE DÉTECTÉE", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
    
    // Stocker l'erreur pour la diagnostiquer plus tard
    try {
      window.lastRenderError = event.error || new Error(event.message);
      
      const netlifyErrors = JSON.parse(localStorage.getItem('netlify_error_logs') || '[]');
      netlifyErrors.push({
        timestamp: new Date().toISOString(),
        message: event.message,
        source: event.filename,
        stack: event.error?.stack || 'Non disponible'
      });
      localStorage.setItem('netlify_error_logs', JSON.stringify(netlifyErrors.slice(-50)));
    } catch (e) {
      console.error("Erreur lors du stockage de l'erreur", e);
    }
  }
}, true);

// Fonction de journalisation personnalisée pour la console
const originalConsoleLog = console.log;
console.log = function(...args) {
  // Appel à la fonction d'origine
  originalConsoleLog.apply(console, args);
  
  // Convertir les arguments en chaîne
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Ajouter au journal de démarrage si pertinent
  if (message.includes('[STARTUP]') || message.includes('Initialisation') || 
      message.includes('React') || message.includes('rendu')) {
    STARTUP_LOG.push(message);
    
    // Mettre à jour localStorage
    try {
      localStorage.setItem('filechat_startup_log', JSON.stringify(STARTUP_LOG.slice(-100)));
    } catch (e) {
      // Ignorer les erreurs de stockage
    }
  }
};

// Fonction de journalisation d'erreur personnalisée
const originalConsoleError = console.error;
console.error = function(...args) {
  // Appel à la fonction d'origine
  originalConsoleError.apply(console, args);
  
  // Convertir les arguments en chaîne
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Toujours enregistrer les erreurs
  logStartup(`[ERROR] ${message}`);
};

// Fonction de journalisation d'avertissement personnalisée
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // Appel à la fonction d'origine
  originalConsoleWarn.apply(console, args);
  
  // Convertir les arguments en chaîne
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Enregistrer les avertissements importants
  if (message.includes('React') || message.includes('rendu') || 
      message.includes('module') || message.includes('network')) {
    logStartup(`[WARN] ${message}`);
  }
};

// Lancer le rendu de l'application avec récupération d'erreur
try {
  logStartup("Début du rendu de l'application");
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactErrorMonitor />
          <App />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  
  logStartup("Rendu de l'application terminé avec succès");
} catch (error) {
  logStartup("ERREUR CRITIQUE lors du rendu initial", {
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

// Exposer une fonction de diagnostic pour Netlify
window.showNetlifyDiagnostic = function() {
  return {
    logs: STARTUP_LOG,
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
