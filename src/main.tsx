
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

// Remplacer l'initialisation Sentry par des logs de diagnostic
console.log('🔍 Initialisation de l\'application - Sentry désactivé temporairement');
console.log('📊 Environnement:', process.env.NODE_ENV);

// Fonction de diagnostic globale pour aider au débogage
window.showDiagnostic = function() {
  return {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  };
};

// Version simplifiée de initSentry pour préserver l'API
window.initSentry = function() {
  console.log('⚠️ Sentry initialisé en mode simulé (désactivé)');
  return true;
};

// Initialisation progressive de l'application sans Sentry
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
    
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE lors de l'initialisation", {
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

// Déclarer le type global
declare global {
  interface Window {
    lastRenderError?: Error;
    showDiagnostic?: () => any;
    Sentry?: any;
    initSentry?: () => boolean;
  }
}
