
// Ce fichier réexporte proprement depuis notre structure de dossier toast
import { useToast } from "./toast/toast-context";
import { createToast as toast } from "./toast/toast-utils";
import type { Toast, ToastVariant } from "./toast/types";

// Nous ne réexportons PAS le ToastProvider ici pour éviter la duplication
export { 
  useToast, 
  toast, 
  type Toast, 
  type ToastVariant 
};
