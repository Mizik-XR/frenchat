
import { React, createContext, useContext } from "@/core/ReactInstance"

import type {
  ToastActionElement,
  ToastProps,
  ToasterToast,
  Toast
} from "@/utils/toast-utils"
import { reducer, genId, addToRemoveQueue } from "@/hooks/toast/toast-reducer"
import { useToastState } from "@/hooks/toast/toast-state"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

interface ToastContextType extends State {
  toast: (props: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

// Create the initial context using the safe method
const ToastContext = createContext<ToastContextType | undefined>(undefined);

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action, TOAST_REMOVE_DELAY, addToRemoveQueue)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, handleState } = useToastState(memoryState)

  React.useEffect(() => {
    listeners.push(handleState);
    return () => {
      const index = listeners.indexOf(handleState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [handleState]);

  return (
    <ToastContext.Provider value={{ ...state, toast, dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }) }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { toast };
