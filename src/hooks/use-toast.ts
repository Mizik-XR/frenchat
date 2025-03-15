
// Ce fichier réexporte le hook useToast et la fonction toast
// Correction : nous exportons maintenant correctement la fonction toast

import { useToast } from "./toast/toast-context";
import { toast } from "./use-toast.tsx";
import type { Toast, ToastVariant } from "./toast/types";

export { useToast, toast };
export type { Toast, ToastVariant };
