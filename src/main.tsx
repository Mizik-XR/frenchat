
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { isLovableScriptLoaded, injectLovableScript } from './utils/lovable/editingUtils';

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("Initialisation de l'application...");
  
  // Vérifier et assurer l'intégration de Lovable
  try {
    // Vérifier l'intégration de Lovable
    const isLoaded = isLovableScriptLoaded();
    
    if (!isLoaded && import.meta.env.DEV) {
      console.warn("Script Lovable non détecté, tentative d'injection...");
      await injectLovableScript();
    } else {
      console.log("Script Lovable vérifié:", isLoaded ? "présent" : "non présent");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'intégration Lovable:", error);
    // Continuer malgré l'erreur pour ne pas bloquer l'application
  }
  
  // Rendre l'application
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Attendre que le DOM soit complètement chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Si le DOM est déjà chargé
  initializeApp();
}
