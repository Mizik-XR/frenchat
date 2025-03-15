
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

import {
  useToast as useToastOriginal,
  toast as toastOriginal,
} from "@radix-ui/react-toast";

// Étendre les variantes de toast pour inclure warning et success
type ExtendedToastProps = ToastProps & {
  variant?: "default" | "destructive" | "warning" | "success";
};

const useToast = () => {
  const { toast: originalToast, ...rest } = useToastOriginal();

  return {
    ...rest,
    toast: (props: ExtendedToastProps) => originalToast(props),
  };
};

type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "warning" | "success";
};

const toast = ({ title, description, action, variant = "default" }: ToastOptions) => {
  toastOriginal({
    title,
    description, 
    action,
    variant,
  });
};

export { useToast, toast };
