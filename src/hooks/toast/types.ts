
import * as React from "react";

export type ToastVariant = "default" | "destructive" | "success" | "warning";

export type ToastActionElement = React.ReactElement;

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// Add the State type that was missing
export type State = { toasts: Toast[] };
