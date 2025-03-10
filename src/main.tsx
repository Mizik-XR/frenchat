
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { isNetlifyEnvironment, getEnvironmentInfo } from './utils/environment/environmentDetection';
import './index.css';

// Système de journalisation amélioré avec stockage dans localStorage
const diagnosticLogger = {
  logs: [] as string[],
  
  log: function(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] INFO: ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
    
    console.log(formattedMessage);
    this.addToStorage(formattedMessage);
  },
  
  warn: function(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] WARN: ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
    
    console.warn(formattedMessage);
    this.addToStorage(formattedMessage);
  },
  
  error: function(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ERROR: ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
    
    console.error(formattedMessage);
    this.addToStorage(formattedMessage);
  },
  
  addToStorage: function(logMessage: string) {
    try {
      this.logs.push(logMessage);
      
      // Limiter à 100 messages en mémoire
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem('filechat_startup_log', JSON.stringify(this.logs));
    } catch (e) {
      // Si localStorage échoue, on continue sans erreur
      console.warn('Échec de sauvegarde des logs dans localStorage:', e);
    }
  }
};

// Fonction pour tester la disponibilité des ressources importantes
const testResourceAvailability = async () => {
  diagnosticLogger.log('Test de disponibilité des ressources');
  
  // Tester le chargement d'une image
  try {
    const imageUrl = './filechat-animation.gif';
    diagnosticLogger.log(`Test de chargement d'image`, { url: imageUrl });
    
    const img = new Image();
    const loadResult = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
    
    diagnosticLogger.log(`Résultat du test d'image`, { success: loadResult, url: imageUrl });
  } catch (e) {
    diagnosticLogger.error(`Erreur lors du test d'image`, { error: e?.toString() });
  }
  
  // Tester le chargement d'un script
  try {
    const scriptContent = 'console.log("Script test chargé avec succès")';
    const blob = new Blob([scriptContent], { type: 'text/javascript' });
    const scriptUrl = URL.createObjectURL(blob);
    
    const script = document.createElement('script');
    const loadResult = await new Promise<boolean>((resolve) => {
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      script.src = scriptUrl;
      document.head.appendChild(script);
    });
    
    diagnosticLogger.log(`Résultat du test de script`, { success: loadResult });
    URL.revokeObjectURL(scriptUrl);
    document.head.removeChild(script);
  } catch (e) {
    diagnosticLogger.error(`Erreur lors du test de script`, { error: e?.toString() });
  }
};

// Point d'entrée principal avec logs détaillés
diagnosticLogger.log('Démarrage de l\'application');
diagnosticLogger.log('Environnement:', { mode: process.env.NODE_ENV });

// Informations supplémentaires pour Netlify
if (isNetlifyEnvironment()) {
  diagnosticLogger.log('Exécution sur Netlify', { hostname: window.location.hostname });
  diagnosticLogger.log('URL complète', { href: window.location.href });
  
  const envInfo = getEnvironmentInfo();
  diagnosticLogger.log('Informations détaillées sur l\'environnement Netlify', envInfo);
}

// Tester les ressources immédiatement au démarrage
testResourceAvailability();

// Fonction de diagnostic globale améliorée
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
    // Informations supplémentaires utiles
    protocol: window.location.protocol,
    base: window.location.origin,
    logs: diagnosticLogger.logs,
    localStorage: Object.keys(localStorage),
  };
  
  diagnosticLogger.log('Diagnostic complet', diagnosticInfo);
  return diagnosticInfo;
};

// Fonction pour afficher un message de chargement
const showLoadingMessage = () => {
  diagnosticLogger.log('Affichage du message de chargement initial');
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
          <p style="font-size: 0.8rem; color: #6b7280;" id="loading-status">
            Initialisation...
          </p>
          <div style="margin-top: 1.5rem;">
            <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
              Rafraîchir
            </button>
            <button onclick="window.location.href='?forceCloud=true'" style="background-color: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
              Mode cloud
            </button>
            <button onclick="window.location.href='/diagnostic.html'" style="background-color: #818cf8; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-top: 0.5rem;">
              Diagnostic
            </button>
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

// Fonction pour mettre à jour le statut de chargement
const updateLoadingStatus = (message: string) => {
  diagnosticLogger.log('Mise à jour du statut:', { message });
  const statusElement = document.getElementById('loading-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
};

// Fonction d'initialisation de l'application avec gestion de récupération
const initializeApp = async () => {
  try {
    diagnosticLogger.log('Début du chargement dynamique de App');
    
    // Afficher un message de chargement
    showLoadingMessage();
    updateLoadingStatus('Chargement des ressources...');
    
    // Tester à nouveau les ressources avant de charger App
    await testResourceAvailability();
    updateLoadingStatus('Chargement du module App...');
    
    // Charger le module App de façon dynamique
    const { default: App } = await import('./App');
    
    diagnosticLogger.log('Module App chargé avec succès');
    updateLoadingStatus('Préparation du rendu...');
    
    // Rendre l'application
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error("Élément root non trouvé dans le DOM");
    }
    
    updateLoadingStatus('Démarrage du rendu React...');
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </React.StrictMode>
    );
    
    diagnosticLogger.log('Rendu React terminé');
    
  } catch (error: any) {
    diagnosticLogger.error('ERREUR CRITIQUE lors de l\'initialisation', {
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
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; margin: 1rem 0; overflow: auto; max-height: 200px;">
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
          <div style="margin-top: 1rem;">
            <a href="/diagnostic.html" 
               style="color: #3b82f6; text-decoration: underline;">
              Ouvrir la page de diagnostic
            </a>
          </div>
        </div>
      `;
    }
    
    // Stocker l'erreur pour la diagnostiquer plus tard
    window.lastRenderError = error;
  }
};

// Ajouter gestionnaire d'erreurs global pour capturer les erreurs non gérées
window.onerror = function(message, source, lineno, colno, error) {
  diagnosticLogger.error('Erreur globale non gérée', {
    message,
    source,
    lineno,
    colno,
    error: error?.stack
  });
  
  return false; // Permettre à l'erreur de se propager pour le débogage
};

// Initialiser l'application après un court délai
diagnosticLogger.log('Planification de l\'initialisation de l\'application');
setTimeout(initializeApp, 200);

// Type global APP_CONFIG
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
