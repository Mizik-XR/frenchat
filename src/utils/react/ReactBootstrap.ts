
import { React } from '@/core/ReactInstance';

// Export React pour garantir une seule instance
export const ReactInstance = React;

// Fonction sécurisée pour createContext
export function safeCreateContext<T>(defaultValue: T) {
  return React.createContext(defaultValue);
}

// Vérifie si React est disponible
export function isReactAvailable(): boolean {
  return typeof React !== 'undefined';
}
