
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Fonction pour vérifier l'intégration du script Lovable
function checkLovableScript(): boolean {
  const isLoaded = document.querySelector('script[src*="gptengineer.js"]') !== null;
  console.log("Lovable script loaded:", isLoaded);
  
  // Vérifier l'initialisation
  const isInitialized = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
  console.log("Lovable initialized:", isInitialized);
  
  if (!isLoaded) {
    console.warn("Lovable script not detected in DOM. Loading it dynamically now...");
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.gpteng.co/gptengineer.js';
      script.type = 'module';
      document.head.appendChild(script);
      return false; // Will need to check again later
    } catch (error) {
      console.error("Failed to load Lovable script:", error);
      return false;
    }
  } else if (!isInitialized) {
    console.warn("Lovable script detected but not initialized. Waiting for initialization...");
    return false;
  }
  
  return isLoaded && isInitialized;
}

// Fonction pour attendre l'initialisation de Lovable
function waitForLovableInit(maxRetries = 5): Promise<boolean> {
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
      setTimeout(check, 1000); // Longer timeout between attempts
    };
    
    check();
  });
}

// Fonction pour injecter le script Lovable si nécessaire
function injectLovableScript(): Promise<void> {
  return new Promise((resolve) => {
    // Vérifie si le script existe déjà
    if (document.querySelector('script[src*="gptengineer.js"]')) {
      console.log("Lovable script already exists in DOM");
      resolve();
      return;
    }
    
    console.log("Injecting Lovable script");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    
    script.onload = () => {
      console.log("Lovable script injected successfully");
      resolve();
    };
    
    script.onerror = () => {
      console.error("Failed to load Lovable script");
      resolve(); // Resolve anyway to continue app initialization
    };
    
    document.head.appendChild(script);
  });
}

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("Initializing application...");
  
  // Injecter le script Lovable si nécessaire (backup)
  if (!document.querySelector('script[src*="gptengineer.js"]')) {
    console.log("Lovable script not found, injecting...");
    await injectLovableScript();
  }
  
  // Vérifier l'intégration Lovable
  const isScriptPresent = checkLovableScript();
  
  // Si en mode développement, attendre l'initialisation de Lovable
  if (!isScriptPresent && import.meta.env.DEV) {
    console.log("Running in development mode, waiting for Lovable initialization...");
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
