
// Fichier pour gérer l'état des toasts
// Extrait depuis use-toast.tsx pour simplifier le code

import { React } from "@/core/ReactInstance";

interface State {
  toasts: any[];
}

export function useToastState(initialState: State) {
  const [state, setState] = React.useState<State>(initialState);

  const handleState = React.useCallback((newState: State) => {
    setState(newState);
  }, []);

  return { state, handleState };
}
