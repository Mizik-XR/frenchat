
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'

// Configuration améliorée pour le déploiement avec gestion des erreurs
const renderApp = () => {
  try {
    // Vérifier que l'élément racine existe
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Élément racine introuvable');
      return;
    }

    // Éviter les conflits avec d'autres environnements et bibliothèques
    // Nettoyer les détections de fonctionnalités qui pourraient venir d'autres projets
    if (window.navigator && 'permissions' in window.navigator) {
      try {
        // Désactiver les requêtes pour les fonctionnalités non utilisées par notre application
        // qui pourraient venir d'autres projets VR en arrière-plan
        const unusedFeatures = ['vr', 'ambient-light-sensor', 'battery', 'accelerometer', 'gyroscope'];
        unusedFeatures.forEach(feature => {
          // Remplacer toute requête existante par une promesse vide
          if (window.navigator.permissions && window.navigator.permissions.query) {
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = function(opts) {
              if (opts && unusedFeatures.includes(opts.name as string)) {
                // Retourner une promesse résolue avec un état fictif pour éviter les erreurs
                return Promise.resolve({ state: 'denied', addEventListener: () => {}, removeEventListener: () => {} });
              }
              // Sinon, utiliser la fonction d'origine
              return originalQuery.apply(this, [opts]);
            };
          }
        });
      } catch (permError) {
        // Ignorer les erreurs de permission, ne pas bloquer le démarrage
        console.warn('Impossible de modifier les permissions du navigateur:', permError);
      }
    }

    // Vérifier si nous sommes dans un environnement de prévisualisation
    const isPreviewEnvironment = window.location.hostname.includes('lovable');
    if (isPreviewEnvironment) {
      console.log('Environnement de prévisualisation détecté, activation du mode cloud');
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
          <p>L'application n'a pas pu démarrer correctement. Veuillez rafraîchir la page.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
            Rafraîchir
          </button>
        </div>
      `;
    }
  } catch (outerError) {
    console.error('Erreur critique lors du démarrage:', outerError);
    // Fallback pour les erreurs très graves
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
};

// Lancer l'application avec une gestion d'erreurs améliorée
window.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

// Exécuter également immédiatement au cas où le DOM est déjà chargé
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
