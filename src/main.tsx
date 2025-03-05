
import React from 'react';
import { showInitialLoadingMessage } from './utils/startup/loadingUtils';
import { handleLoadError, checkForFallbackMode, renderFallbackScreen } from './utils/startup/errorHandlingUtils';
import { checkReactDependencies, setupReactDOM, preloadSupabaseSession, setupNetworkListeners } from './utils/startup/setupUtils';
import { createQueryClient, startRendering } from './utils/startup/appRenderer';
import { checkLovableIntegration, injectLovableScript } from './utils/lovable/editingUtils';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import './index.css';

// Log pour débogage
console.log("Initialisation de l'application...");

// Fonction pour démarrer l'application de manière robuste
const startApp = async () => {
  try {
    // Vérifier l'intégration Lovable en mode développement
    if (import.meta.env.DEV) {
      checkLovableIntegration();
      try {
        await injectLovableScript();
      } catch (e) {
        console.warn("Impossible d'injecter dynamiquement le script Lovable:", e);
      }
    }
    
    // Afficher un message de chargement pour feedback immédiat
    showInitialLoadingMessage();
    
    // Vérifier explicitement que React est disponible
    setupReactDOM();
    
    // Mode de secours (simplifié, sans tentatives de préchargement)
    const fallbackMode = checkForFallbackMode();
    
    // Préchargement de la session Supabase (si non en mode de secours)
    if (!fallbackMode) {
      await preloadSupabaseSession(fallbackMode);
    }

    // Configuration du client de requête
    const queryClient = createQueryClient();

    // Démarrer le rendu de l'application
    startRendering(queryClient);
    
    // Configurer les écouteurs d'événements réseau
    setupNetworkListeners();
    
  } catch (error) {
    console.error("Erreur lors du montage de l'application:", error);
    handleLoadError(error instanceof Error ? error : new Error(String(error)));
  }
};

// Essayer de démarrer l'application avec timeout de sécurité
let appStarted = false;
const safetyTimeout = setTimeout(() => {
  if (!appStarted) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      renderFallbackScreen(rootElement, "Chargement prolongé...");
    }
  }
}, 10000); // 10 secondes avant d'afficher l'écran de chargement prolongé

// Démarrer l'application
startApp().then(() => {
  appStarted = true;
  clearTimeout(safetyTimeout);
}).catch(error => {
  clearTimeout(safetyTimeout);
  handleLoadError(error instanceof Error ? error : new Error(String(error)));
});
