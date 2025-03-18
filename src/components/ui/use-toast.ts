
/**
 * Réexportation du hook use-toast pour maintenir la compatibilité avec les composants UI
 */
import { useToast, toast } from "@/hooks/use-toast";
import type { Toast } from "@/utils/toast-utils";

export { useToast, toast, type Toast };
