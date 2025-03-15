
// Export simplifié pour le système de toast
// Pour éviter les références circulaires, ce fichier exporte uniquement
// les types et fonctions nécessaires
import { useToast } from "./toast-context";
import { toast } from "./toast-utils";
import type { Toast, ToastVariant } from "./types";

export { useToast, toast };
export type { Toast, ToastVariant };
