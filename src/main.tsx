
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializeLovable } from './utils/lovable/editingUtils';

// Vérifier si le code s'exécute côté client
const isClient = typeof window !== 'undefined';

// Initialiser Lovable au démarrage de l'application
if (import.meta.env.MODE !== 'production') {
  console.log("Initialisation de l'environnement d'édition");
  initializeLovable();
}

// Solution pour le problème de useLayoutEffect côté serveur
if (isClient) {
  // Importez le composant LoadingScreen pour l'afficher pendant le chargement
  import('./components/auth/LoadingScreen').then(({ LoadingScreen }) => {
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      // Afficher un écran de chargement initial
      const root = ReactDOM.createRoot(rootElement);
      root.render(<LoadingScreen message="Chargement de l'application..." />);
      
      // Suppression de l'écran de chargement statique HTML si présent
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      
      // Charger l'application après un court délai pour éviter les problèmes de useLayoutEffect
      setTimeout(() => {
        try {
          root.render(
            <React.StrictMode>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </React.StrictMode>
          );
          console.log("Application chargée avec succès");
        } catch (error) {
          console.error("Erreur lors du rendu de l'application:", error);
          root.render(
            <LoadingScreen 
              message="Erreur de chargement" 
              showRetry={true} 
            />
          );
        }
      }, 100);
    } else {
      console.error("Élément racine 'root' non trouvé dans le DOM");
    }
  }).catch(error => {
    console.error("Erreur lors du chargement du composant LoadingScreen:", error);
  });
} else {
  console.log("Environnement non-client détecté, rendu reporté");
}
