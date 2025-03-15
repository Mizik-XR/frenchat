
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { isLovableScriptLoaded, injectLovableScript } from './utils/lovable/editingUtils';

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("🔄 Initialisation de l'application...");
  
  try {
    // Vérifier et injecter le script Lovable si nécessaire
    if (!isLovableScriptLoaded()) {
      console.log("💉 Script Lovable non détecté, injection en cours...");
      try {
        await injectLovableScript();
        console.log("✅ Script Lovable injecté avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de l'injection du script Lovable:", error);
      }
    } else {
      console.log("✅ Script Lovable déjà présent dans le DOM");
    }
    
    // Initialiser React
    console.log("🚀 Montage de l'application React...");
    const root = createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ Application React montée avec succès");
  } catch (error) {
    console.error("❌ Erreur critique pendant l'initialisation:", error);
    
    // Afficher une erreur visible sur la page
    const rootElement = document.getElementById('root');
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
  document.addEventListener('DOMContentLoaded', () => initializeApp());
} else {
  initializeApp();
}
