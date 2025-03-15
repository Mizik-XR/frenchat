
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { handleLoadError, renderFallbackScreen } from '@/utils/startup/errorHandlingUtils';

// Import custom detection utils
import { initializeLovable } from '@/utils/lovable/lovableIntegration';

// Create .env.local file for cloud mode
// Try to create the file to force cloud mode for development
function createEnvLocalFile() {
  if (typeof window !== 'undefined' && window.location.search.includes('forceCloud=true')) {
    console.log("Force cloud mode activated - attempting to set up environment");
    try {
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    } catch (e) {
      console.warn("Failed to set localStorage", e);
    }
  }
}

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
    React.createElement('div');
    return true;
  } catch (error) {
    console.error("React n'est pas correctement initialisé:", error);
    return false;
  }
}

// Fonction pour initialiser l'application avec des vérifications
function initializeApp() {
  console.log("🚀 Initialisation de l'application...");
  
  // Create cloud mode env file if needed
  createEnvLocalFile();
  
  // Assurer que le DOM est prêt
  if (document.readyState === 'loading') {
    console.log("DOM n'est pas encore prêt, attente...");
    return; // Le DOMContentLoaded déclenchera l'initialisation
  }
  
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
      
      // Redirection automatique vers le mode cloud après un court délai
      setTimeout(() => {
        window.location.href = '/?forceCloud=true&mode=cloud&client=true';
      }, 2000);
      
      return;
    }
    
    // Vérifier si le script Lovable est chargé
    if (!isLovableScriptLoaded()) {
      console.warn("⚠️ Script Lovable non détecté - les fonctionnalités d'édition pourraient ne pas fonctionner");
      // Tentative d'injection du script Lovable si nécessaire (développement)
      initializeLovable();
    }
    
    console.log("🔄 Montage de l'application React...");
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ Application React montée avec succès");
    
    // Mettre à jour le statut d'initialisation React
    if (window.__REACT_INIT_STATUS__) {
      window.__REACT_INIT_STATUS__.initialized = true;
    }
    
  } catch (error) {
    console.error("❌ Erreur critique pendant l'initialisation:", error);
    handleLoadError(error as Error);
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

// Définir un délai maximum pour le montage de l'application
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && loadingScreen.parentElement) {
    // Fix: Using parentElement instead of parentNode.id
    const isRootParent = loadingScreen.parentElement.id === 'root';
    
    if (isRootParent) {
      console.warn("⚠️ Délai de montage dépassé, tentative de récupération...");
      const errorMessage = document.querySelector('.error-message');
      const retryBtn = document.querySelector('.retry-btn');
      
      if (errorMessage) {
        (errorMessage as HTMLElement).style.display = 'block';
        (errorMessage as HTMLElement).textContent = "L'application met plus de temps que prévu à démarrer. Essayez le mode cloud.";
      }
      
      if (retryBtn) {
        (retryBtn as HTMLElement).style.display = 'inline-block';
      }
    }
  }
}, 10000); // 10 secondes de délai maximum
