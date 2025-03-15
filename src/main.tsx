
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Fonction pour vérifier si le script Lovable est chargé
function isLovableScriptLoaded() {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes('gptengineer.js')) {
      return true;
    }
  }
  return false;
}

// Fonction pour initialiser l'application
function initializeApp() {
  console.log("🚀 Initialisation de l'application...");
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("❌ Élément racine non trouvé dans le DOM");
    return;
  }
  
  try {
    console.log("🔄 Montage de l'application React...");
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ Application React montée avec succès");
  } catch (error) {
    console.error("❌ Erreur critique pendant l'initialisation:", error);
    
    // Afficher une erreur visible sur la page
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui; padding: 20px; text-align: center;">
          <h2 style="color: #e11d48;">Erreur lors de l'initialisation</h2>
          <p>Une erreur est survenue pendant le chargement de l'application.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Rafraîchir la page
          </button>
        </div>
      `;
    }
  }
}

// S'assurer que le DOM est chargé avant d'initialiser
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, démarrage de l'initialisation");
    initializeApp();
  });
} else {
  console.log("DOM déjà chargé, démarrage immédiat de l'initialisation");
  initializeApp();
}
