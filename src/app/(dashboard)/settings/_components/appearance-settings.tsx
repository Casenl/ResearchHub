"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

const DENSITY_OPTIONS = [
  { value: "default" as const, label: "Default" },
  { value: "compact" as const, label: "Compact" },
];

export function AppearanceSettings(): React.JSX.Element {
  const { theme, density, setTheme, setDensity } = useTheme();

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground mb-3">
            Choose how the interface appears.
          </p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Density</p>
          <p className="text-xs text-muted-foreground mb-3">
            Adjust the spacing and size of interface elements.
          </p>
          <div className="flex gap-2">
            {DENSITY_OPTIONS.map((option) => {
              const isActive = density === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDensity(option.value)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
