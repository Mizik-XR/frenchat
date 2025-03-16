
// Stratégie d'importation claire et directe
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/message-styles.css';

// Fonction de rendu simple et robuste
const renderApp = () => {
  try {
    // Récupérer l'élément racine
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error("Élément root non trouvé");
      document.body.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h1>Erreur critique</h1>
          <p>L'élément #root est introuvable dans le DOM.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem;">
            Rafraîchir
          </button>
        </div>
      `;
      return;
    }
    
    // Créer la racine React et rendre l'application
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("Application rendue avec succès");
  } catch (error) {
    console.error("Erreur critique lors du démarrage:", error);
    
    // Afficher une page d'erreur en HTML pur si React échoue
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; text-align: center;">
            <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">Mode de secours FileChat</h1>
            <p style="margin-bottom: 1.5rem; color: #4b5563;">
              L'application n'a pas pu démarrer correctement.
              ${error instanceof Error ? `<br>Erreur: ${error.message}` : ''}
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <button onclick="window.location.href = '/?mode=safe&forceCloud=true'" style="background-color: #4f46e5; color: white; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
                Mode sécurisé
              </button>
              <button onclick="localStorage.clear(); window.location.href = '/?reset=true'" style="background-color: white; color: #ef4444; border: 1px solid #ef4444; padding: 0.75rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-top: 0.5rem;">
                Réinitialisation complète
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Lancer le rendu quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Gestionnaire global d'erreurs
window.addEventListener('error', (event) => {
  console.error('Erreur non gérée détectée:', event.error);
  
  if (event.error && event.error.message?.includes('React')) {
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    
    // Redirection avec paramètres de mode sécurisé sans boucle infinie
    if (!window.location.search.includes('mode=safe')) {
      window.location.href = '/?mode=safe&forceCloud=true';
    }
  }
});
