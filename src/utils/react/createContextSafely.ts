
/**
 * Utilitaire pour créer des contextes React de manière sécurisée
 * évitant les problèmes liés aux différentes instances de React
 */

import { React } from "@/core/ReactInstance";
import type { Context } from 'react';

/**
 * Interface étendue pour notre contexte sécurisé
 */
export interface SafeContext<T> extends Context<T> {
  useContext: () => T;
}

/**
 * Crée un contexte React avec des méthodes utilitaires supplémentaires
 * pour garantir l'utilisation de la même instance React
 * 
 * @param defaultValue La valeur par défaut du contexte
 * @returns Un contexte React avec des méthodes utilitaires
 */
export function createContextSafely<T>(defaultValue: T): SafeContext<T> {
  const Context = React.createContext<T>(defaultValue);
  
  // Créer notre contexte étendu avec une propriété useContext personnalisée
  const SafeContext = Context as SafeContext<T>;
  
  // Ajouter une méthode useContext sécurisée au contexte
  SafeContext.useContext = () => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`useContext must be used within a ${Context.displayName || 'Context'} Provider`);
    }
    return context;
  };

  return SafeContext;
}
