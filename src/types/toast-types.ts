
import { React } from "@/core/ReactInstance";

// Types pour le toast
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type ToastActionElement = React.ReactElement;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

export type Toast = Omit<ToasterToast, "id">;
