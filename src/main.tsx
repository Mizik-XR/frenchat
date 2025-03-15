
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkLovableIntegration, ensureLovableIntegration } from './utils/lovable/lovableIntegrationCheck';

// Fonction pour initialiser l'application
async function initializeApp() {
  console.log("Initialisation de l'application...");
  
  // Vérifier et assurer l'intégration de Lovable
  try {
    // Vérifier l'intégration de Lovable
    const isIntegrated = checkLovableIntegration();
    
    if (!isIntegrated) {
      console.warn("Intégration Lovable non détectée, tentative de réparation...");
      await ensureLovableIntegration();
    } else {
      console.log("Intégration Lovable vérifiée avec succès.");
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
