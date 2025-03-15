
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { 
  isLovableScriptLoaded, 
  injectLovableScript, 
  forceResetLovable,
  directInitializeEditor
} from './utils/lovable/editingUtils';

/**
 * Tentative d'initialisation de Lovable avec plusieurs essais si nécessaire
 * @returns Promise résolue quand l'initialisation est terminée
 */
async function initializeLovable(maxAttempts = 3): Promise<boolean> {
  console.log("🔄 Initialisation de Lovable...");
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`⚙️ Tentative d'initialisation ${attempts}/${maxAttempts}`);
    
    try {
      if (!isLovableScriptLoaded()) {
        console.log("💉 Script Lovable non détecté, injection en cours...");
        await injectLovableScript();
      } else {
        console.log("🔍 Script Lovable détecté, vérification de l'initialisation...");
        
        // Si le script est présent mais pas initialisé après 5 secondes, forcer une réinitialisation
        await new Promise<void>(resolve => {
          setTimeout(() => {
            const initialized = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
            if (!initialized && attempts < maxAttempts) {
              console.warn("⚠️ Script Lovable présent mais non initialisé, tentative de réinitialisation...");
              forceResetLovable().then(resolve);
            } else {
              resolve();
            }
          }, 5000);
        });
      }
      
      // Vérifier si l'initialisation a réussi
      const globalObject = (window as any).__GPT_ENGINEER__;
      if (typeof globalObject !== 'undefined') {
        console.log("✅ Script Lovable initialisé avec succès:", globalObject);
        return true;
      }
    } catch (error) {
      console.error("❌ Erreur pendant l'initialisation de Lovable:", error);
    }
    
    // Attendre avant la prochaine tentative
    if (attempts < maxAttempts) {
      console.log("⏱️ Attente avant nouvelle tentative...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // En dernier recours, tenter l'initialisation directe
  console.warn("⚠️ Échec de l'initialisation standard de Lovable après plusieurs tentatives");
  console.log("🔧 Tentative d'initialisation directe...");
  directInitializeEditor();
  
  return false;
}

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("🚀 Initialisation de l'application...");
  
  try {
    // Tenter d'initialiser Lovable avec plus de tentatives
    await initializeLovable(5);
    
    // Initialiser React indépendamment du succès de Lovable
    console.log("🔄 Montage de l'application React...");
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
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, démarrage de l'initialisation");
    initializeApp();
  });
} else {
  console.log("DOM déjà chargé, démarrage immédiat de l'initialisation");
  initializeApp();
}
