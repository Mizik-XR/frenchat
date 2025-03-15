
// Ce fichier réexporte le hook useToast et la fonction toast
import { useToast } from "./toast/toast-context";
import { createToast as toast } from "./toast/toast-utils";
import type { Toast, ToastVariant } from "./toast/types";

export { useToast, toast, type Toast, type ToastVariant };
