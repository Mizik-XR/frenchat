
// Ce fichier réexporte le hook useToast et la fonction toast
// Correction importante : nous n'exportons pas directement de la fonction toast 
// qui crée une erreur d'initialisation - tout passe par le hook useToast

import { useToast } from "./toast/toast-context";

export { useToast };
export type { Toast, ToastVariant } from "./use-toast.tsx";

// Nous ne réexportons PAS la fonction toast directement
// car cela cause l'erreur d'initialisation cyclique
