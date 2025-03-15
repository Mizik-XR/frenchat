
import React, { createContext, useContext, useState, useMemo } from "react";
import { State, Toast } from "./types";
import { dispatch, memoryState, listeners, createToast } from "./toast-utils";

type ToastContextType = {
  state: State;
  toast: (props: Omit<Toast, "id"> & { id?: string }) => { 
    id: string; 
    dismiss: () => void; 
    update: (props: any) => void 
  };
  dismiss: (toastId?: string) => void;
};

// Contexte interne pour la gestion des toasts
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider pour la gestion d'état des toasts (n'utilise pas le Radix Provider)
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(memoryState);

  // Gérer la synchronisation avec le système de mémorisation
  useMemo(() => {
    const unsubscribe = (listener: (state: State) => void) => {
      listeners.splice(listeners.indexOf(listener), 1);
    };

    const listener = (state: State) => {
      setState(state);
    };

    listeners.push(listener);
    return () => {
      unsubscribe(listener);
    };
  }, []);

  // Fonction pour créer un toast
  const toast = (props: Omit<Toast, "id"> & { id?: string }) => {
    return createToast(props);
  };

  // Fonction pour fermer un toast
  const dismiss = (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  };

  // Valeur du contexte
  const value = {
    state,
    toast,
    dismiss,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// Hook pour utiliser le système de toast
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return {
    toast: context.toast,
    dismiss: context.dismiss,
    toasts: context.state.toasts,
  };
}
