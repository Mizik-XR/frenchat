
// Fichier pour regrouper la logique de réduction des toasts
// Ceci évite d'avoir trop de logique dans le hook use-toast.tsx

import type { ToasterToast } from "@/utils/toast-utils";

interface State {
  toasts: ToasterToast[];
}

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast>;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: ToasterToast["id"];
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: ToasterToast["id"];
    };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function genId() {
  let count = 0;
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export function addToRemoveQueue(toastId: string, delay: number) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    return { type: "REMOVE_TOAST", toastId } as Action;
  }, delay);

  toastTimeouts.set(toastId, timeout);
}

export function reducer(
  state: State,
  action: Action,
  TOAST_REMOVE_DELAY: number,
  addToQueue: (id: string, delay: number) => void
): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 1), // Limit to 1 toast
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Side effects
      if (toastId) {
        addToQueue(toastId, TOAST_REMOVE_DELAY);
      } else {
        state.toasts.forEach((toast) => {
          addToQueue(toast.id, TOAST_REMOVE_DELAY);
        });
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
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}
