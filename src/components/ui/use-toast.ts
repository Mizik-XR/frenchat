
// Réexportation simple du hook use-toast depuis son emplacement source
// et des types depuis le fichier de types partagés
import { useToast, toast } from "@/hooks/use-toast";
import { Toast, ToastProps, ToastActionElement } from "@/types/toast-types";

export { 
  useToast, 
  toast,
  type Toast,
  type ToastProps,
  type ToastActionElement
};
