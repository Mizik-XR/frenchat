
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

console.log('🚀 Démarrage de l\'application minimale (sans Sentry)');

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

// Fonction minimale simulant Sentry pour maintenir la compatibilité d'API
window.initSentry = function() {
  console.log('⚠️ Sentry est complètement désactivé dans cette version minimale');
  return false;
};

// Composant App minimal
const MinimalApp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Filechat - Version Minimale</h1>
        <p className="mb-4">Cette version simplifiée de l'application est conçue pour diagnostiquer les problèmes d'initialisation.</p>
        
        <div className="my-6 p-4 bg-gray-50 rounded text-left">
          <h2 className="text-lg font-medium mb-2">Diagnostic:</h2>
          <div className="text-sm font-mono">
            <p>Environnement: {process.env.NODE_ENV}</p>
            <p>Navigateur: {navigator.userAgent}</p>
            <p>En ligne: {navigator.onLine ? 'Oui' : 'Non'}</p>
            <p>Heure: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Accueil
          </button>
          <button 
            onClick={() => console.log('Test de console: ', window.showDiagnostic())}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Test Console
          </button>
        </div>
      </div>
    </div>
  );
};

// Initialisation de l'application
const initializeMinimalApp = () => {
  try {
    console.log('📦 Initialisation de l\'application minimale');
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
        <MinimalApp />
      </React.StrictMode>
    );
    
    console.log('✅ Rendu de l\'application minimale terminé avec succès');
    
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
          <p>Une erreur est survenue lors du chargement de l'application minimale.</p>
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; margin: 1rem 0;">
            ${error.message}
          </div>
          <button onclick="window.location.reload()" 
                  style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; 
                         border-radius: 0.25rem; cursor: pointer;">
            Recharger la page
          </button>
        </div>
      `;
    }
    
    // Stocker l'erreur pour la diagnostiquer plus tard
    window.lastRenderError = error;
  }
};

// Démarrer l'initialisation
initializeMinimalApp();

// Déclarer le type global
declare global {
  interface Window {
    lastRenderError?: Error;
    showDiagnostic?: () => any;
    Sentry?: any;
    initSentry?: () => boolean;
  }
}
