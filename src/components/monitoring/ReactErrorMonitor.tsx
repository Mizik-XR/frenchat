
import { useErrorLogger } from './error-monitor/useErrorLogger';
import { useErrorHandlers } from './error-monitor/useErrorHandlers';
import { useDebugFunctions } from './error-monitor/useDebugFunctions';

/**
 * Composant qui surveille et capture les erreurs React non gérées
 * et les affiche de manière non intrusive à l'utilisateur
 */
export const ReactErrorMonitor = () => {
  // Utilisation des hooks modulaires
  const { logToConsole } = useErrorLogger();
  useErrorHandlers(logToConsole);
  useDebugFunctions();

  // Ce composant ne rend rien visuellement
  return null;
};
