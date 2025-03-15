
import { Toast, State } from "./types";

// Internal state management
export const listeners: ((state: State) => void)[] = [];
export const memoryState: State = { toasts: [] };

// Action handler for toast state management
type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string };

export const dispatch = (action: Action): void => {
  memoryState.toasts = reducer(memoryState.toasts, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

// Standard reducer for toast actions
const reducer = (state: Toast[], action: Action): Toast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.toast];

    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      );

    case "DISMISS_TOAST":
      if (action.toastId) {
        return state.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        );
      }
      return state.map((t) => ({ ...t, open: false }));
  }
};

// Helper function to create toasts
export const createToast = (props: Omit<Toast, "id"> & { id?: string }) => {
  const id = props.id || String(Date.now());

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id });
      },
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: Partial<Toast>) => {
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      });
    },
  };
};

// Export the toast function directly for easier imports
export const toast = createToast;
