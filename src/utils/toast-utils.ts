
import { React } from "@/core/ReactInstance";

/**
 * Types partagés pour le système de toast
 * Ce fichier sert d'intermédiaire pour éviter les dépendances circulaires
 * entre components/ui et hooks/use-toast
 */

// Types de base pour le toast
export type ToastActionElement = React.ReactElement<unknown>;

// Types partagés pour la configuration des toasts
export interface ToastProps {
  id?: string;
  className?: string;
  variant?: "default" | "destructive";
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Structure d'un toast avec toutes ses propriétés
export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

// Type simplifié pour la création d'un toast
export type Toast = Omit<ToasterToast, "id">;
