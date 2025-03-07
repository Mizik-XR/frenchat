
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'
import './styles/chat.css'

// Fonction pour arrêter l'animation de chargement
function stopLoadingAnimation() {
  try {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.parentNode) {
      loadingScreen.parentNode.removeChild(loadingScreen);
    }
  } catch (error) {
    console.warn('Erreur lors de la suppression de l\'écran de chargement:', error);
  }
}

// Créer une variable pour signaler que le rendu a commencé
window.appRenderStarted = true;

// Créer et rendre l'application React
try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Élément root non trouvé dans le DOM');
  }
  
  // Créer le root React
  const reactRoot = ReactDOM.createRoot(root);
  
  // Rendre l'application
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  // Après le rendu réussi, supprimer l'écran de chargement
  setTimeout(() => {
    stopLoadingAnimation();
  }, 500);
  
  // Signaler que l'application est chargée
  window.appLoaded = true;
  
} catch (error) {
  console.error('Erreur lors du rendu de l\'application:', error);
  
  // En cas d'erreur, mettre à jour l'écran de chargement pour afficher un message d'erreur
  const errorMessage = document.querySelector('.error-message');
  const retryButton = document.querySelector('.retry-btn');
  
  if (errorMessage instanceof HTMLElement) {
    errorMessage.textContent = 'Erreur lors du chargement de l\'application: ' + ((error as Error).message || 'Erreur inconnue');
    errorMessage.style.display = 'block';
  }
  
  if (retryButton instanceof HTMLElement) {
    retryButton.style.display = 'inline-block';
  }
}

// Ajouter un fichier d'environnement global pour éviter des erreurs d'accès
declare global {
  interface Window {
    appRenderStarted?: boolean;
    appLoaded?: boolean;
  }
}
