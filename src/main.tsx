
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'

// Configuration améliorée pour le déploiement
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Élément racine introuvable');
    return;
  }

  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('Application rendue avec succès');
  } catch (error) {
    console.error('Erreur lors du rendu de l\'application:', error);
    // Fallback pour l'affichage d'une erreur à l'utilisateur
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>Erreur de chargement</h1>
        <p>L'application n'a pas pu démarrer correctement. Veuillez rafraîchir la page.</p>
      </div>
    `;
  }
};

// Initialisation de l'application
renderApp();
