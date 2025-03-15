
// Ce fichier réexporte proprement depuis notre structure de dossier toast
import { useToast, ToastProvider } from "./toast/toast-context";
import { createToast as toast } from "./toast/toast-utils";
import type { Toast, ToastVariant } from "./toast/types";

export { 
  useToast, 
  ToastProvider, 
  toast, 
  type Toast, 
  type ToastVariant 
};
