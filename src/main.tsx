
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/message-styles.css';
import App from './App';
import { initializeLovable } from './utils/lovable/lovableIntegration';

// S'assurer que le DOM est complètement chargé avant d'initialiser React
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Élément racine introuvable. Impossible d'initialiser l'application.");
    return;
  }
  
  try {
    // Initialiser Lovable si nécessaire
    initializeLovable();
    
    // Initialisation de React avec une méthode simple et directe
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("Application React initialisée avec succès");
  } catch (error) {
    console.error("Erreur critique lors de l'initialisation de React:", error);
    
    // Afficher un message d'erreur explicite en cas d'échec
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 20px; font-family: sans-serif;">
        <h2 style="color: #e53e3e;">Erreur d'initialisation</h2>
        <p>L'application n'a pas pu démarrer correctement.</p>
        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Essayer à nouveau
        </button>
        <button onclick="window.location.href='recovery.html'" style="margin-top: 15px; margin-left: 10px; padding: 8px 16px; background: white; color: #3182ce; border: 1px solid #3182ce; border-radius: 4px; cursor: pointer;">
          Mode de récupération
        </button>
      </div>
    `;
  }
});

// Gestionnaire global d'erreurs pour capturer les problèmes non gérés
window.addEventListener('error', (event) => {
  console.error('Erreur non interceptée:', event.error);
});
