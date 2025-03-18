import type { ToasterToast } from "@/utils/toast-utils"

interface State {
  toasts: ToasterToast[]
}

type ActionType = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

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

// Générateur d'ID unique pour les toasts
let count = 0

export function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Gestion des timeouts pour la suppression automatique des toasts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const addToRemoveQueue = (toastId: string, delay: number, dispatch: (action: Action) => void) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, delay)

  toastTimeouts.set(toastId, timeout)
}

// Reducer pour gérer les états des toasts
export const reducer = (
  state: State, 
  action: Action, 
  toastRemoveDelay: number,
  addToQueueFn: (toastId: string, delay: number, dispatch: (action: Action) => void) => void
): State => {
  const addToQueue = (toastId: string) => addToQueueFn(toastId, toastRemoveDelay, (action) => {
    // Cette fonction sera appelée par le timeout
    // On ne peut pas utiliser dispatch directement car il n'est pas encore défini à ce stade
    // Nous utilisons donc une fonction qui sera fournie plus tard
  });

  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 1), // TOAST_LIMIT est hardcoded à 1 ici
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}
