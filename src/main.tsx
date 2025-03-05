
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializeLovable } from './utils/lovable/editingUtils';

// Initialiser Lovable au démarrage de l'application
if (import.meta.env.MODE !== 'production') {
  console.log("Initialisation de l'environnement d'édition");
  initializeLovable();
}

// Créer une fonction pour rendre l'application après le chargement du DOM
const renderApp = () => {
  // Obtenir l'élément racine
  const rootElement = document.getElementById('root');

  // Vérifier que l'élément existe
  if (!rootElement) {
    console.error("Élément racine 'root' non trouvé dans le DOM");
    return;
  }

  // Supprimer l'écran de chargement initial s'il existe
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }

  // Utiliser createRoot pour assurer la compatibilité avec React 18
  const root = ReactDOM.createRoot(rootElement);

  // Assurer que les composants sont rendus dans un environnement client (browser) pour éviter les problèmes de useLayoutEffect
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Exécuter le rendu immédiatement si le DOM est déjà chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
