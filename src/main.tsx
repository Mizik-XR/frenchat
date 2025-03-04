
import './index.css'
import * as React from 'react'
import { startApp } from './utils/appInitializer'
import { renderFallback } from './utils/appInitializer'
import { handleLoadError } from './utils/errorHandlingUtils'
import { logEnvironmentInfo, isPreviewEnvironment, getPublicPath } from './utils/environmentUtils'

// Log pour débogage
console.log("Initialisation de l'application...", {
  env: import.meta.env.MODE,
  publicPath: getPublicPath(),
  isPreview: isPreviewEnvironment(),
  location: window.location.href
});

// Vérification de la version de React
console.log("Version de React utilisée:", React.version);

// Journaliser les informations d'environnement
logEnvironmentInfo();

// Installer un gestionnaire d'erreurs global
window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error || event.message);
  // Ne pas bloquer les erreurs de ressources (comme les images manquantes)
  if (event.target && ['LINK', 'SCRIPT', 'IMG'].includes((event.target as any).tagName)) {
    console.warn(`Échec de chargement de ressource: ${(event.target as HTMLElement).outerHTML}`);
  }
}, true);

// Essayer de démarrer l'application avec timeout de sécurité
let appStarted = false;
const safetyTimeout = setTimeout(() => {
  if (!appStarted) {
    console.warn("Timeout de démarrage atteint - Affichage du fallback");
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
  
  // Vérifier les erreurs de ressources
  const failedResources = [];
  window.addEventListener('error', function(e) {
    if (e.target && (e.target as any).tagName === 'LINK' || (e.target as any).tagName === 'SCRIPT' || (e.target as any).tagName === 'IMG') {
      failedResources.push((e.target as any).src || (e.target as any).href);
      console.error('Erreur de chargement de ressource:', (e.target as any).src || (e.target as any).href);
    }
  }, true);
  
  setTimeout(() => {
    if (failedResources.length > 0) {
      console.warn('Ressources non chargées:', failedResources);
    }
  }, 3000);
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("Événement DOMContentLoaded déclenché");
});
