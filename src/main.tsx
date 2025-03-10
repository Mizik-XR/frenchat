
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { initializeAppWithErrorRecovery } from './utils/startup/loadingUtils';
import { isNetlifyEnvironment, getEnvironmentInfo } from './utils/environment/environmentDetection';
import './index.css';

// Remplacer l'initialisation Sentry par des logs de diagnostic
console.log('🔍 Initialisation de l\'application - Sentry désactivé temporairement');
console.log('📊 Environnement:', process.env.NODE_ENV);

// Ajouter des informations spécifiques pour Netlify
if (isNetlifyEnvironment()) {
  console.log('🌐 Exécution sur Netlify:', window.location.hostname);
  console.log('🔄 URL complète:', window.location.href);
  console.log('🔧 API URL:', import.meta.env.VITE_API_URL);
  console.log('🔧 SITE URL:', import.meta.env.VITE_SITE_URL);
  
  // Logs détaillés pour le débogage sur Netlify
  const envInfo = getEnvironmentInfo();
  console.log('📋 Informations détaillées sur l\'environnement Netlify:', envInfo);
  
  // Stocker les informations dans localStorage pour le diagnostic
  try {
    localStorage.setItem('filechat_env_info', JSON.stringify(envInfo));
    console.log('💾 Informations d\'environnement sauvegardées dans localStorage');
  } catch (e) {
    console.warn('⚠️ Impossible de sauvegarder les informations dans localStorage:', e);
  }
  
  // Vérifier les chemins relatifs
  console.log('🔍 Vérification des chemins relatifs:');
  console.log('- Base URL:', document.baseURI);
  const linkElements = document.querySelectorAll('link[href]');
  console.log('- Nombre de liens dans le document:', linkElements.length);
  const scriptElements = document.querySelectorAll('script[src]');
  console.log('- Nombre de scripts dans le document:', scriptElements.length);
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
    search: window.location.search,
    // Ajouter des informations spécifiques à Netlify
    netlifySpecific: isNetlifyEnvironment() ? {
      deployUrl: window.location.origin,
      // @ts-ignore - L'objet n'existe pas toujours
      deployContext: window.netlifyDeployContext || 'unknown',
      // Vérifier les chemins de base pour les assets
      assetPaths: {
        relativeRoot: new URL('./assets', window.location.href).href,
        absoluteRoot: new URL('/assets', window.location.origin).href,
        baseURI: document.baseURI
      },
      apiUrl: import.meta.env.VITE_API_URL,
      envVars: {
        VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
        VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
        VITE_CLOUD_MODE: import.meta.env.VITE_CLOUD_MODE,
        VITE_NETLIFY_DEPLOYMENT: import.meta.env.VITE_NETLIFY_DEPLOYMENT
      }
    } : null,
    // Tests de connectivité
    connectivity: {
      navigatorOnline: navigator.onLine,
      lastConnectivityCheck: new Date().toISOString()
    },
    // Test des ressources critiques
    resourceTests: {
      cssLoaded: document.styleSheets.length > 0,
      mainDiv: document.getElementById('root') !== null
    }
  };
  
  console.log('📊 Diagnostic complet:', diagnosticInfo);
  return diagnosticInfo;
};

// Version simplifiée de initSentry pour préserver l'API
window.initSentry = function() {
  console.log('⚠️ Sentry initialisé en mode simulé (désactivé)');
  if (isNetlifyEnvironment()) {
    console.log('📝 Mode Netlify détecté, Sentry sera configuré lors de la réintégration progressive');
  }
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
  console.log('☁️ Mode cloud forcé par paramètre d\'URL ou variable d\'environnement');
}

if (isNetlify) {
  console.log('🌐 Mode Netlify détecté');
}

if (debugMode) {
  console.log('🐞 Mode debug activé par paramètre d\'URL');
}

// Fonction d'initialisation de l'application principale
const initializeApp = async () => {
  try {
    console.log('🚀 Démarrage de l\'initialisation progressive');
    
    // 1. Charger le module App de façon dynamique
    console.log('📦 Chargement dynamique du module App...');
    const { default: App } = await import('./App');
    
    // 2. Rendre l'application
    console.log('🎨 Début du rendu de l\'application');
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
          <App />
          <Toaster />
        </ThemeProvider>
      </React.StrictMode>
    );
    
    console.log('✅ Rendu de l\'application terminé avec succès');
    
    // Déclencher le diagnostic automatique sur Netlify
    if (isNetlifyEnvironment()) {
      console.log('🔍 Exécution du diagnostic automatique Netlify');
      setTimeout(() => {
        window.showDiagnostic();
      }, 2000);
    }
    
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE lors de l'initialisation", {
      message: error.message,
      stack: error.stack,
      isNetlify: isNetlifyEnvironment()
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

// Utiliser notre fonction de récupération d'erreur améliorée pour initialiser l'application
initializeAppWithErrorRecovery(initializeApp);

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
