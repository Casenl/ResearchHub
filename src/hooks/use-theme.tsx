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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
  });
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem(DENSITY_KEY) as Density | null) ?? "default";
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
    return resolveTheme(stored);
  });

  // Apply theme and density to DOM on mount
  useEffect(() => {
    applyTheme(resolvedTheme);
    applyDensity(density);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- one-time DOM init

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
