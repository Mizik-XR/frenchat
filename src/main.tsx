
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Fonction pour vérifier l'intégration du script Lovable
function checkLovableScript() {
  const isLoaded = document.querySelector('script[src*="gptengineer.js"]') !== null;
  console.log("Lovable script loaded:", isLoaded);
  
  // Vérifier l'initialisation
  const isInitialized = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
  console.log("Lovable initialized:", isInitialized);
  
  if (!isLoaded) {
    console.warn("Lovable script not detected in DOM. Editing might not work correctly.");
  } else if (!isInitialized) {
    console.warn("Lovable script detected but not initialized. This might cause editing issues.");
  }
  
  return isLoaded && isInitialized;
}

// Fonction pour attendre l'initialisation de Lovable
function waitForLovableInit(maxRetries = 3): Promise<boolean> {
  return new Promise((resolve) => {
    let retries = 0;
    
    const check = () => {
      if (typeof (window as any).__GPT_ENGINEER__ !== 'undefined') {
        console.log("Lovable successfully initialized!");
        resolve(true);
        return;
      }
      
      retries++;
      if (retries >= maxRetries) {
        console.warn(`Lovable not initialized after ${maxRetries} attempts. Continuing anyway.`);
        resolve(false);
        return;
      }
      
      console.log(`Waiting for Lovable initialization (attempt ${retries}/${maxRetries})...`);
      setTimeout(check, 500);
    };
    
    check();
  });
}

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("Initializing application...");
  
  // Vérifier l'intégration Lovable
  const isScriptPresent = checkLovableScript();
  
  // Si en mode développement, attendre l'initialisation de Lovable
  if (isScriptPresent && import.meta.env.DEV) {
    await waitForLovableInit();
  }
  
  // Log d'information sur l'environnement
  console.log("Environment:", import.meta.env.MODE);
  console.log("Browser:", navigator.userAgent);
  console.log("URL:", window.location.href);
  
  // Initialiser React
  try {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React application rendered successfully");
  } catch (error) {
    console.error("Error rendering React application:", error);
  }
}

// Attendre que le DOM soit complètement chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Si le DOM est déjà chargé
  initializeApp();
}

// Afficher un avertissement au redémarrage
window.addEventListener('beforeunload', () => {
  console.log("Application shutting down...");
});
