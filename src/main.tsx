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
    // Vérifier si l'application est en mode de récupération via l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const isRecoveryMode = urlParams.get('mode') === 'recovery';
    
    if (isRecoveryMode) {
      console.log('Application démarrée en mode récupération');
      // Forcer le mode cloud et réinitialiser les paramètres problématiques
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
      localStorage.removeItem('useLocalAI');
      localStorage.removeItem('last_route');
    }

    // Vérifier que l'élément racine existe
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Élément racine introuvable');
      document.body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Erreur critique</h1>
          <p>L'élément racine #root est introuvable dans le DOM.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem;">
            Réessayer
          </button>
        </div>
      `;
      return;
    }

    // Vérification explicite des modules React critiques
    if (typeof React === 'undefined') {
      throw new Error("React n'est pas défini");
    }
    
    if (typeof ReactDOM === 'undefined' || typeof ReactDOM.createRoot !== 'function') {
      throw new Error("ReactDOM.createRoot n'est pas disponible");
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
      
      // Basculer en mode de récupération - évite la boucle infinie d'erreurs
      if (!isRecoveryMode) {
        console.log('Tentative de basculement en mode récupération...');
        localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        localStorage.setItem('aiServiceType', 'cloud');
        window.location.href = '/?mode=recovery&forceCloud=true';
      } else {
        // Déjà en mode récupération mais erreur persistante, afficher une page de récupération HTML pure
        rootElement.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <h1>Erreur de chargement</h1>
            <p>L'application n'a pas pu démarrer correctement même en mode récupération.</p>
            <p style="color: red; margin: 1rem 0;">Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
            <div>
              <button onclick="window.location.href = '/recovery.html'" style="padding: 0.5rem 1rem; background: #4F46E5; color: white; border: none; margin-right: 0.5rem;">
                Page de récupération
              </button>
              <button onclick="localStorage.clear(); window.location.reload()" style="padding: 0.5rem 1rem;">
                Réinitialiser et réessayer
              </button>
            </div>
          </div>
        `;
      }
    }
  } catch (outerError) {
    console.error('Erreur critique lors du démarrage:', outerError);
    
    // Traiter l'erreur de manière sécurisée avec fallback HTML pur
    const errorMessage = outerError instanceof Error ? outerError.message : String(outerError);
    if (document.getElementById('root')) {
      handleLoadError(outerError instanceof Error ? outerError : new Error(errorMessage));
    } else {
      document.body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Erreur critique</h1>
          <p>Une erreur critique s'est produite pendant le démarrage de l'application.</p>
          <p style="color: red; margin: 1rem 0;">${errorMessage}</p>
          <button onclick="window.location.href = '/recovery.html'" style="padding: 0.5rem 1rem; background: #4F46E5; color: white; border: none; margin-right: 0.5rem;">
            Page de récupération
          </button>
          <button onclick="window.location.href = '/?forceCloud=true&reset=true'" style="padding: 0.5rem 1rem;">
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
