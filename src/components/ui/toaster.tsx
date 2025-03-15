
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";

// Composants pour les toasts
export const ToastTitle = React.forwardRef<
  HTMLDivElement, 
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm font-semibold ${className}`}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLDivElement, 
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastClose = React.forwardRef<
  HTMLButtonElement, 
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 ${className}`}
    toast-close=""
    {...props}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
));
ToastClose.displayName = "ToastClose";

export function Toast({
  className,
  variant = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixToast.Root> & {
  variant?: "default" | "destructive" | "success" | "warning";
}) {
  const variantStyles = {
    default: "bg-background border",
    destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
  };

  return (
    <RadixToast.Root
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose onClick={() => props.onOpenChange?.(false)} />
          </Toast>
        );
      })}
    </>
  );
}
