
import * as React from "react";
import { useToast as useInternalToast } from "./toast/toast-context";

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export type ToastVariant = "default" | "destructive" | "success" | "warning";

export type ToastActionElement = React.ReactElement;

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
};

// On exporte simplement le hook useToast sans créer de nouveau provider
export const useToast = useInternalToast;

// Fonction d'aide pour créer un toast
export const toast = (props: Omit<Toast, "id"> & { id?: string }) => {
  const { toast: internalToast } = useInternalToast();
  return internalToast(props);
};

// Composant Toast pour le rendu
export function Toast({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="alert"
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
