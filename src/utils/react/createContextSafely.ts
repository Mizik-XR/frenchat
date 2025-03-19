
/**
 * Utilitaire pour créer des contextes React de manière sécurisée
 * évitant les problèmes liés aux différentes instances de React
 */

import { React } from "@/core/ReactInstance";

/**
 * Crée un contexte React avec des méthodes utilitaires supplémentaires
 * pour garantir l'utilisation de la même instance React
 * 
 * @param defaultValue La valeur par défaut du contexte
 * @returns Un contexte React avec des méthodes utilitaires
 */
export function createContextSafely<T>(defaultValue: T) {
  const Context = React.createContext<T>(defaultValue);
  
  // Ajouter une méthode useContext sécurisée au contexte
  Context.useContext = () => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`useContext must be used within a ${Context.displayName || 'Context'} Provider`);
    }
    return context;
  };

  return Context;
}
