
import * as React from "react";
import { ToastContextType, State } from "./types";
import { 
  createToast, 
  dispatch, 
  listeners, 
  memoryState 
} from "./toast-utils";

// Create toast context
const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <ToastContext.Provider 
      value={{ 
        toasts: state.toasts, 
        toast: (props) => {
          return createToast(props);
        },
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId })
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}
