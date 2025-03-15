
import React, { createContext, useContext, useState, useMemo } from "react";
import { State } from "./types";
import { dispatch, memoryState, listeners } from "./toast-utils";
import * as RadixToast from "@radix-ui/react-toast";

type ToastContextType = {
  state: State;
  toast: (props: any) => { id: string; dismiss: () => void; update: (props: any) => void };
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
  const toast = (props: any) => {
    // Générer un ID unique basé sur le timestamp actuel
    const id = props.id || String(Date.now());
    
    // Dispatcher l'action pour ajouter le toast
    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss(id);
        },
      },
    });

    // Retourner l'API pour interagir avec ce toast
    return {
      id,
      dismiss: () => dismiss(id),
      update: (props: any) => {
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        });
      },
    };
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

// Export de la fonction toast pour utilisation sans hook
export const toast = (props: any) => {
  if (typeof window === 'undefined') return { id: '', dismiss: () => {}, update: () => {} };
  
  // Cette fonction sera utilisée pour les appels hors composants React
  // Elle lancera une erreur si appelée en dehors d'un contexte React
  // Les cas d'utilisation réels devraient toujours utiliser le hook useToast()
  throw new Error(
    "La fonction toast() ne peut pas être appelée directement en dehors d'un composant React. Utilisez le hook useToast() à la place."
  );
};
