
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/chat.css';
import { initializeLovable } from './utils/lovable/lovableIntegration';
import { initializeAppWithErrorRecovery } from './utils/startup/loadingUtils';

// Vérifier si le code s'exécute côté client
const isClient = typeof window !== 'undefined';

// Initialiser Lovable au démarrage de l'application
if (import.meta.env.MODE !== 'production') {
  console.log("Initialisation de l'environnement d'édition");
  initializeLovable();
}

// Solution pour éviter les problèmes de rendu
if (isClient) {
  // Fonction pour initialiser l'application avec gestion d'erreur
  initializeAppWithErrorRecovery(() => {
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      try {
        const root = ReactDOM.createRoot(rootElement);

        // Rendre l'application avec une fonction différée pour éviter les erreurs useLayoutEffect
        const renderApp = () => {
          root.render(
            <React.StrictMode>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </React.StrictMode>
          );
          console.log("Application chargée avec succès");
        };

        // Utiliser un timeout de 0 pour différer le rendu et éviter les problèmes de useLayoutEffect
        setTimeout(renderApp, 0);

      } catch (error) {
        console.error("Erreur critique lors du rendu:", error);
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
              <h1 style="color: #e11d48; margin-bottom: 1rem;">Erreur critique</h1>
              <p>Impossible de charger l'application. Essayez de rafraîchir la page.</p>
              <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                Rafraîchir
              </button>
            </div>
          `;
        }
      }
    } else {
      console.error("Élément racine 'root' non trouvé dans le DOM");
    }
  });
} else {
  console.log("Environnement non-client détecté, rendu reporté");
}
