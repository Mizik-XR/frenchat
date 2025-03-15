
// Import depuis l'implémentation réelle de hooks/toast/toast-utils.ts
import { useToast } from "@/hooks/toast/toast-context";
import { toast } from "@/hooks/toast/toast-utils";
import type { Toast, ToastVariant } from "@/hooks/toast/types";

// Ne pas exporter ToastProvider d'ici
export { useToast, toast, type Toast, type ToastVariant };
