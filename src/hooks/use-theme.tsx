"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// =============================================================================
// Types
// =============================================================================

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type Density = "default" | "compact";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  density: Density;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
}

// =============================================================================
// Constants
// =============================================================================

const THEME_KEY = "itq-theme";
const DENSITY_KEY = "itq-density";

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =============================================================================
// Helpers
// =============================================================================

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function applyDensity(density: Density): void {
  const root = document.documentElement;
  if (density === "compact") {
    root.classList.add("compact");
  } else {
    root.classList.remove("compact");
  }
}

// =============================================================================
// Provider
// =============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>("system");
  const [density, setDensityState] = useState<Density>("default");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Initialize from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const storedDensity = localStorage.getItem(DENSITY_KEY) as Density | null;

    const initialTheme = storedTheme ?? "system";
    const initialDensity = storedDensity ?? "default";

    setThemeState(initialTheme);
    setDensityState(initialDensity);

    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    applyDensity(initialDensity);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
    localStorage.setItem(DENSITY_KEY, newDensity);
    applyDensity(newDensity);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, density, setTheme, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
