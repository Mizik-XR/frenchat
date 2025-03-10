
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'
import { testLovableFunction } from './utils/lovable/lovableTestFile.ts'

// Configuration améliorée pour le déploiement
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Élément racine introuvable');
    return;
  }

  try {
    // Test de l'intégration Lovable
    console.log("Test d'intégration Lovable:", testLovableFunction());
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('Application rendue avec succès');
    
    // Nettoyer l'écran de chargement
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Transition en douceur
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  } catch (error) {
    console.error('Erreur lors du rendu de l\'application:', error);
    // Fallback pour l'affichage d'une erreur à l'utilisateur
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>Erreur de chargement</h1>
        <p>L'application n'a pas pu démarrer correctement. Veuillez rafraîchir la page.</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow: auto; max-width: 800px; margin: 0 auto;">${String(error)}</pre>
      </div>
    `;
  }
};

// Initialisation de l'application
renderApp();
