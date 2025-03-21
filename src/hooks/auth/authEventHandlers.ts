
// Ce fichier exporte les fonctions pour gérer les événements d'authentification
// Il a été refactorisé pour réduire sa taille et améliorer la maintenabilité

import { handleAuthSession } from "./authSessionHandlers";
import { handleAuthStateChange, useAuthStateChangeHandler } from "./authStateChangeHandlers";
import { useInitialSessionCheck } from "./initialSessionCheck";

// Exporter toutes les fonctions nécessaires
export {
  handleAuthSession,
  handleAuthStateChange,
  useAuthStateChangeHandler,
  useInitialSessionCheck
};
