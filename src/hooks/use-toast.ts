
// Ce fichier réexporte le hook useToast et la fonction toast pour plus de compatibilité
import { useToast } from "./toast/toast-context";
import { toast } from "./toast/toast-utils";
import type { Toast, ToastVariant } from "./toast/types";

export { useToast, toast };
export type { Toast, ToastVariant };
