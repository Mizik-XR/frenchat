
// Nous n'importons plus useToast et toast de @radix-ui/react-toast car ils n'existent pas
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

// Type étendu pour inclure les variantes warning et success
export type ToastVariant = "default" | "destructive" | "warning" | "success";

// Type pour les options de toast
export type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastVariant;
};

// Créer notre propre implémentation qui re-exporte depuis @/components/ui/use-toast
export { useToast } from "@/components/ui/use-toast";

// Fonction toast pour afficher des notifications
export const toast = ({ title, description, action, variant = "default" }: ToastOptions) => {
  // Importer dynamiquement pour éviter les problèmes de référence circulaire
  const { toast: internalToast } = require("@/components/ui/use-toast");
  
  internalToast({
    title,
    description, 
    action,
    variant,
  });
};
