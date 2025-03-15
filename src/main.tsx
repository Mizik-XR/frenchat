
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { handleLoadError, renderFallbackScreen } from '@/utils/startup/errorHandlingUtils';

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

// Fonction pour s'assurer que React est correctement chargé
function ensureReactLoaded() {
  try {
    // Test simple pour vérifier que React est disponible et fonctionne
    React.createContext({});
    return true;
  } catch (error) {
    console.error("React n'est pas correctement initialisé:", error);
    return false;
  }
}

// Fonction pour initialiser l'application avec des vérifications
function initializeApp() {
  console.log("🚀 Initialisation de l'application...");
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("❌ Élément racine non trouvé dans le DOM");
    return;
  }
  
  try {
    // Vérifier que React est correctement chargé
    if (!ensureReactLoaded()) {
      console.error("❌ React n'est pas correctement initialisé");
      renderFallbackScreen(rootElement, "Problème d'initialisation de React");
      return;
    }
    
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
    handleLoadError(error);
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
