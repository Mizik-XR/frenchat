
// Fichier de compatibilité avec shadcn/ui - redirige vers notre implémentation de toast
import { useToast } from "@/hooks/toast/toast-context";
import { toast } from "@/hooks/toast/toast-utils";
import type { Toast, ToastVariant } from "@/hooks/toast/types";

// Réexporte les éléments nécessaires pour la compatibilité avec shadcn
export { useToast, toast, type Toast, type ToastVariant };
