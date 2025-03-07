
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'

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

// Créer et rendre l'application React
try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  // Après le rendu réussi, supprimer l'écran de chargement
  setTimeout(() => {
    stopLoadingAnimation();
  }, 500);
} catch (error) {
  console.error('Erreur lors du rendu de l\'application:', error);
  
  // En cas d'erreur, mettre à jour l'écran de chargement pour afficher un message d'erreur
  const errorMessage = document.querySelector('.error-message');
  const retryButton = document.querySelector('.retry-btn');
  
  if (errorMessage) {
    errorMessage.textContent = 'Erreur lors du chargement de l\'application: ' + (error.message || 'Erreur inconnue');
    errorMessage.style.display = 'block';
  }
  
  if (retryButton) {
    retryButton.style.display = 'inline-block';
  }
}
