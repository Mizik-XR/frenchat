
import { useState, useCallback } from "@/core/ReactInstance"
import type { ToasterToast } from "@/utils/toast-utils"

interface State {
  toasts: ToasterToast[]
}

export function useToastState(initialState: State) {
  const [state, setState] = useState<State>(initialState);

  // Nous utilisons useCallback pour éviter que l'effet ne soit réexécuté à chaque rendu
  const handleState = useCallback((newState: State) => {
    setState(newState);
  }, []);

  return { state, handleState };
}
