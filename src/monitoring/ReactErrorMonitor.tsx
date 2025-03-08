
import { useErrorHandlers } from './hooks/useErrorHandlers';
import { useDebugFunctions } from './hooks/useDebugFunctions';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * Version refactorisée avec une architecture modulaire
 */
export const ReactErrorMonitor = () => {
  // Utiliser les hooks pour les gestionnaires d'erreurs
  useErrorHandlers();
  
  // Utiliser les hooks pour les fonctions de débogage
  useDebugFunctions();

  // Ce composant ne rend rien visuellement
  return null;
};
