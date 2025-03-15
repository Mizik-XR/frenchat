
import React, { createContext, useContext, useState, useMemo } from "react";
import { State } from "./types";
import { dispatch, memoryState, listeners } from "./toast-utils";
import * as RadixToast from "@radix-ui/react-toast";

type ToastContextType = {
  state: State;
  toast: (props: any) => { id: string; dismiss: () => void; update: (props: any) => void };
  dismiss: (toastId?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Note: Ce provider est maintenant utilisé uniquement pour la gestion d'état interne
// et utilise le RadixToastProvider depuis App.tsx pour le rendu des toasts UI
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(memoryState);

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

  const toast = (props: any) => {
    const id = props.id || String(Date.now());
    
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

  const dismiss = (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  };

  const value = {
    state,
    toast,
    dismiss,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

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
