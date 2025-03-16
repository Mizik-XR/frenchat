
// Stratégie d'importation pour éviter les problèmes de chargement
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/message-styles.css';
import { handleLoadError } from './utils/startup/errorHandlingUtils';

// Configuration améliorée pour le déploiement avec gestion des erreurs
const renderApp = () => {
  try {
    // Vérifier que l'élément racine existe
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Élément racine introuvable');
      return;
    }

    // Vérification explicite que React est disponible
    if (typeof React === 'undefined') {
      console.error("React n'est pas défini");
      throw new Error("React dependency missing");
    }

    // Vérification explicite que createRoot est disponible
    if (typeof ReactDOM.createRoot !== 'function') {
      console.error("ReactDOM.createRoot n'est pas une fonction");
      throw new Error("ReactDOM.createRoot not available");
    }

    // Forcer le mode cloud en environnement de prévisualisation (lovable, etc.)
    if (window.location.hostname.includes('lovable') || 
        window.location.pathname.includes('preview') ||
        window.location.hostname.includes('netlify')) {
      console.log('Environnement de prévisualisation détecté, activation du mode cloud');
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
    }

    // Vérifier les paramètres d'URL pour forcer le mode cloud
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('forceCloud') === 'true' || urlParams.get('mode') === 'cloud') {
      console.log('Mode cloud forcé par paramètres URL');
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
    }

    // Utiliser une méthode try/catch pour le rendu React
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
      console.log('Application rendue avec succès');
    } catch (error) {
      console.error('Erreur lors du rendu de l\'application:', error);
      
      // Afficher une erreur à l'utilisateur
      rootElement.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Erreur de chargement</h1>
          <p>L'application n'a pas pu démarrer correctement.</p>
          <div style="margin-top: 1rem;">
            <button onclick="window.location.href = '/?forceCloud=true&mode=safe'" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
              Mode sécurisé
            </button>
            <button onclick="localStorage.clear(); window.location.reload();" style="padding: 0.5rem 1rem;">
              Réinitialiser
            </button>
          </div>
        </div>
      `;
    }
  } catch (outerError) {
    console.error('Erreur critique lors du démarrage:', outerError);
    // Traiter l'erreur de manière sécurisée
    if (document.getElementById('root')) {
      handleLoadError(outerError instanceof Error ? outerError : new Error(String(outerError)));
    } else {
      document.body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Erreur critique</h1>
          <p>Une erreur critique s'est produite pendant le démarrage de l'application.</p>
          <button onclick="window.location.href = '/?forceCloud=true&reset=true'" style="padding: 0.5rem 1rem; margin-top: 1rem;">
            Redémarrer en mode sécurisé
          </button>
        </div>
      `;
    }
  }
};

// Lancer l'application avec une gestion des erreurs améliorée
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Ajouter une détection des erreurs globales pour améliorer la résilience
window.addEventListener('error', (event) => {
  console.error('Erreur non gérée détectée:', event.error);
  
  // Si l'erreur est liée à React ou aux bibliothèques de rendu
  if (event.error && (
    event.error.message?.includes('React') || 
    event.error.message?.includes('renderToString') ||
    event.error.message?.includes('useLayoutEffect') ||
    event.error.message?.includes('createRoot')
  )) {
    console.warn('Erreur critique de rendu détectée, basculement en mode de secours...');
    
    // Forcer le mode cloud pour éviter les problèmes avec les services locaux
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    
    // Redirection avec paramètres de mode sécurisé
    if (!window.location.search.includes('mode=safe')) {
      window.location.href = '/?mode=safe&forceCloud=true&reset=partial';
    }
  }
}, { capture: true });
