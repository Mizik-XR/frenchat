
// Import depuis l'implémentation réelle de hooks/toast
import { useToast } from "@/hooks/toast/toast-context";
import { createToast as toast } from "@/hooks/toast/toast-utils";
import type { Toast, ToastVariant } from "@/hooks/toast/types";

// Ne pas exporter ToastProvider d'ici
export { useToast, toast, type Toast, type ToastVariant };
