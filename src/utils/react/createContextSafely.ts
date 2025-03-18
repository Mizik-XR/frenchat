
/**
 * Utilitaire pour créer des contextes React de manière sécurisée
 * 
 * Ce module offre des fonctions pour créer et utiliser des contextes React
 * en garantissant une instance unique de React et en évitant les problèmes
 * liés aux différentes instances React dans les builds de production.
 */

import { React } from '@/core/ReactInstance';

/**
 * Crée un contexte React avec des valeurs par défaut typées
 * @param defaultValue Valeur par défaut du contexte
 * @returns Contexte React typé
 */
export function createContextSafely<T>(defaultValue: T) {
  return React.createContext(defaultValue);
}

/**
 * Crée un contexte React qui requiert un Provider
 * @returns Contexte React avec un Provider requis
 */
export function createRequiredContext<T>() {
  const context = React.createContext<T | undefined>(undefined);
  
  function useRequiredContext() {
    const ctx = React.useContext(context);
    if (ctx === undefined) {
      throw new Error('useRequiredContext must be used within its Provider');
    }
    return ctx;
  }
  
  return {
    Provider: context.Provider,
    useContext: useRequiredContext
  };
}

/**
 * Crée un hook et un Provider pour un contexte avec une logique personnalisée
 * @param useValue Hook qui fournit la valeur du contexte
 * @returns Objet contenant le Provider et un hook pour accéder au contexte
 */
export function createContextProvider<T, P = {}>(
  useValue: (props: P) => T,
  displayName?: string
) {
  const context = React.createContext<T | undefined>(undefined);
  
  if (displayName) {
    context.displayName = displayName;
  }
  
  function Provider(props: React.PropsWithChildren<P>) {
    const value = useValue(props);
    return React.createElement(
      context.Provider,
      { value },
      props.children
    );
  }
  
  function useContext() {
    const ctx = React.useContext(context);
    if (ctx === undefined) {
      throw new Error(
        `use${displayName || 'Context'} must be used within a ${
          displayName || 'Context'
        }Provider`
      );
    }
    return ctx;
  }
  
  return {
    Provider,
    useContext
  };
}

/**
 * Crée un Provider avec un state et des actions typés
 * Utile pour implémenter des patterns de state management légers
 * @param defaultState État initial
 * @param actions Actions pour modifier l'état
 * @returns Contexte avec Provider et hook d'accès
 */
export function createStateContext<
  State,
  Actions extends Record<string, (...args: any[]) => any>,
  Result extends { state: State } & {
    [K in keyof Actions]: Actions[K]
  }
>(
  defaultState: State,
  createActions: (
    state: State, 
    setState: React.Dispatch<React.SetStateAction<State>>
  ) => Actions
) {
  return createContextProvider<Result>((props) => {
    const [state, setState] = React.useState(defaultState);
    
    const actions = React.useMemo(
      () => createActions(state, setState),
      [state]
    );
    
    return {
      state,
      ...actions
    } as Result;
  });
}
