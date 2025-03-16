
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/message-styles.css';
import App from './App';

const rootElement = document.getElementById('root');

// Fonction de rendu simplifiée
function renderApp() {
  try {
    if (!rootElement) {
      console.error('Élément root non trouvé');
      return;
    }
    
    // Utilisation directe de createRoot sans intermédiaires
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('Application rendue avec succès');
  } catch (error) {
    console.error('Erreur critique lors du rendu:', error);
    
    // Fallback en HTML pur si React échoue
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: #f5f7fb;">
          <div style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 24px; max-width: 500px; width: 100%;">
            <h2 style="color: #e11d48; margin-bottom: 16px;">Erreur de chargement</h2>
            <p style="margin-bottom: 16px;">L'application n'a pas pu démarrer correctement. Veuillez essayer les options ci-dessous :</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Rafraîchir la page
              </button>
              <button onclick="window.location.href='/?mode=safe&forceCloud=true'" style="background: white; color: #3b82f6; border: 1px solid #3b82f6; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Mode de secours
              </button>
              <button onclick="localStorage.clear(); window.location.href='/?reset=true'" style="background: white; color: #e11d48; border: 1px solid #e11d48; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Réinitialisation complète
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Exécuter le rendu uniquement quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Gestionnaire global d'erreurs
window.addEventListener('error', (event) => {
  console.error('Erreur non gérée:', event.error);
  localStorage.setItem('FORCE_CLOUD_MODE', 'true');
  localStorage.setItem('aiServiceType', 'cloud');
});
