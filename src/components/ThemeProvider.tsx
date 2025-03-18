
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { React } from "@/core/ReactInstance";

/**
 * Fournisseur de thème pour l'application
 * Utilise next-themes pour gérer le thème light/dark
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
