
// Fichier de compatibilité pour shadcn/ui - utilise notre système de toast
import { useToast } from "@/hooks/toast/toast-context";
import { toast } from "@/hooks/toast/toast-utils";
import type { Toast as ToastType, ToastVariant, ToastActionElement } from "@/hooks/toast/types";

// Export des noms standards pour la compatibilité avec shadcn
export { useToast, toast };
export type { ToastType as Toast, ToastVariant, ToastActionElement };
