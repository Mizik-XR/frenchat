
import * as React from "react";
import { useToast as useInternalToast } from "./toast/toast-context";
import { ToastActionElement, Toast, ToastVariant } from "./toast/types";
import { createToast } from "./toast/toast-utils";

// Re-export types
export type { Toast, ToastVariant, ToastActionElement };

// Export the hook for use inside components
export const useToast = useInternalToast;

// Export the toast function for direct usage
// This is the function that is missing in all imports
export const toast = createToast;

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
