
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import * as React from "react";

export type ToastVariant = "default" | "destructive" | "warning" | "success";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
};

export type Toast = Partial<Omit<ToasterToast, "id">>;

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

export type ActionType = typeof actionTypes;

export type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

export interface State {
  toasts: ToasterToast[];
}

export interface ToastContextType extends State {
  toast: (props: Partial<Omit<ToasterToast, "id">>) => {
    id: string;
    dismiss: () => void;
    update: (props: Partial<ToasterToast>) => void;
  };
  dismiss: (toastId?: string) => void;
}
