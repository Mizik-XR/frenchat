
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Version simplifiée de l'application sans Sentry ni providers complexes
const AppMinimal = () => {
  console.log("Rendu du composant AppMinimal");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Application Filechat</h1>
        <p className="text-center mb-4">Version minimaliste pour diagnostiquer les problèmes d'initialisation</p>
        <div className="mt-4 p-4 bg-muted rounded-md text-sm">
          <p className="font-medium">État de l'initialisation:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li className="text-green-600">React initialisé avec succès</li>
            <li className="text-green-600">DOM monté correctement</li>
            <li className="text-green-600">Styles chargés</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Fonction d'initialisation progressive avec journalisation détaillée
const initializeMinimalApp = () => {
  console.log("1. Début de l'initialisation minimale");
  
  try {
    // Trouver l'élément racine
    const rootElement = document.getElementById('root');
    console.log("2. Élément racine trouvé:", !!rootElement);
    
    if (!rootElement) {
      throw new Error("Élément root non trouvé dans le DOM");
    }
    
    // Masquer l'écran de chargement
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      console.log("3. Masquage de l'écran de chargement");
      loadingScreen.style.display = 'none';
    }
    
    // Créer la racine React
    console.log("4. Création de la racine React");
    const root = createRoot(rootElement);
    
    // Rendre l'application
    console.log("5. Début du rendu React");
    root.render(
      <React.StrictMode>
        <AppMinimal />
      </React.StrictMode>
    );
    
    console.log("6. Rendu React terminé avec succès");
    
    // Exposer des fonctions de diagnostic pour résoudre les problèmes
    window.diagTools = {
      checkReactStatus: () => {
        console.log("React est correctement initialisé");
        return true;
      },
      appVersion: "minimal-debug-1.0"
    };
    
  } catch (error) {
    console.error("ERREUR CRITIQUE lors de l'initialisation minimale:", error);
    
    // Afficher une interface de secours en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #e11d48;">Erreur lors de l'initialisation minimale</h2>
          <p>Une erreur est survenue lors du chargement de la version simplifiée.</p>
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; margin: 1rem 0;">
            ${error.message}
          </div>
          <button onclick="window.location.reload()" 
                  style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; 
                         border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
            Recharger la page
          </button>
        </div>
      `;
    }
    
    // Stocker l'erreur pour diagnostic
    window.initError = error;
  }
};

// Démarrer l'initialisation
console.log("0. Chargement du script main-minimal.tsx");
initializeMinimalApp();

// Définir le type global
declare global {
  interface Window {
    initError?: Error;
    diagTools?: {
      checkReactStatus: () => boolean;
      appVersion: string;
    }
  }
}
