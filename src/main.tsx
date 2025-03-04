
import './index.css'
import * as React from 'react'
import { startApp } from './utils/appInitializer'
import { renderFallback } from './utils/appInitializer'
import { handleLoadError } from './utils/errorHandlingUtils'

// Log pour débogage
console.log("Initialisation de l'application...")

// Vérification de la version de React
console.log("Version de React utilisée:", React.version);

// Essayer de démarrer l'application avec timeout de sécurité
let appStarted = false;
const safetyTimeout = setTimeout(() => {
  if (!appStarted) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      renderFallback(rootElement);
    }
  }
}, 5000);

// Démarrer l'application
console.log("Tentative de démarrage de l'application...");
startApp().then((success) => {
  appStarted = success;
  clearTimeout(safetyTimeout);
  if (success) {
    console.log("Application démarrée avec succès");
  }
}).catch(error => {
  clearTimeout(safetyTimeout);
  console.error("Échec du démarrage de l'application:", error);
  handleLoadError(error);
});

// Log des événements de chargement de la page
window.addEventListener('load', () => {
  console.log("Événement window.load déclenché");
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("Événement DOMContentLoaded déclenché");
});
