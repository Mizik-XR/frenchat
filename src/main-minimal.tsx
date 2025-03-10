
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import './index.css';

// Polyfills essentiels pour éviter les erreurs communes
window.unstable_scheduleCallback = window.unstable_scheduleCallback || function() {
  console.log('[Polyfill] unstable_scheduleCallback appelé dans main-minimal');
  return null;
};

window.unstable_cancelCallback = window.unstable_cancelCallback || function() {
  console.log('[Polyfill] unstable_cancelCallback appelé dans main-minimal');
  return null;
};

console.log('Démarrage de la version minimale de Filechat');

// Composant App minimal pour tester le chargement
const MinimalApp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">Filechat (Minimal)</h1>
        <p className="mb-6">Version minimale chargée avec succès!</p>
        
        <p className="text-green-600 font-medium mb-4">
          ✅ Chargement React réussi
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            onClick={() => window.location.href = '/'}
          >
            Essayer l'application normale
          </button>
          
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded transition"
            onClick={() => window.location.href = '/diagnostic.html'}
          >
            Ouvrir la page de diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction d'initialisation ultra-simplifiée
const initializeMinimalApp = () => {
  try {
    console.log('Initialisation de la version minimale');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Élément root non trouvé");
    }
    
    const root = createRoot(rootElement);
    
    // Rendu avec un minimum absolu de providers
    root.render(
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <MinimalApp />
      </ThemeProvider>
    );
    
    console.log('Version minimale rendue avec succès');
    
  } catch (error) {
    console.error('Erreur lors du chargement de la version minimale:', error);
    
    // Interface de secours ultra-simple
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #e11d48;">Erreur critique</h2>
          <p>Même la version minimale n'a pas pu être chargée.</p>
          <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: left; font-size: 0.8rem;">
            ${error.toString()}
          </div>
          <a href="/diagnostic.html" style="display: inline-block; margin-top: 1rem; color: #3b82f6;">
            Aller à la page de diagnostic
          </a>
        </div>
      `;
    }
  }
};

// Exécuter l'initialisation
initializeMinimalApp();
