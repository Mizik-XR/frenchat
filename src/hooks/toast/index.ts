
export { useToast } from "./toast-context";
export { createToast, dispatch } from "./toast-utils";
export type { Toast, ToastVariant, State } from "./types";

// Exporter la fonction toast pour compatibilité
export { createToast as toast } from "./toast-utils";
