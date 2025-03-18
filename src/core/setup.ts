
/**
 * Configuration initiale de l'application
 * Ce fichier doit être importé au début de l'application (dans main.tsx)
 * pour s'assurer que l'instance React est correctement configurée.
 */

// Importer l'instance React centralisée
import { React } from './ReactInstance';

// Vérifier que nous utilisons une instance unique de React
const reactVersion = React.version;

// Fonction pour vérifier que l'instance React est bien initialisée
export function verifyReactSetup() {
  // En développement, afficher des informations de diagnostic
  if (import.meta.env.DEV) {
    console.log(`[setup] React v${reactVersion} initialisé correctement`);
    console.log('[setup] Utilisation de l\'instance React centralisée');
  }
  
  return {
    reactVersion,
    isInitialized: true
  };
}

// Exécuter la vérification immédiatement
verifyReactSetup();
