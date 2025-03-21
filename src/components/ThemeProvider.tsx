
import { React, useState, useEffect, createContext } from "@/core/ReactInstance";
import { createContextSafely } from "@/utils/react/createContextSafely";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

// Création du contexte avec la nouvelle API
const { Context: ThemeProviderContext, useContext: useThemeContext } = createContextSafely(initialState, "ThemeContext");

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      try {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
      } catch (error) {
        // En cas d'erreur d'accès au localStorage
        console.warn("Erreur d'accès au localStorage:", error);
        return defaultTheme;
      }
    }
  );

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    } catch (error) {
      console.error("Erreur lors de l'application du thème:", error);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.warn("Erreur lors de l'enregistrement du thème:", error);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useThemeContext();

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
