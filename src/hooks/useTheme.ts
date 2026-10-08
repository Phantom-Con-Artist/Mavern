import { useEffect, useState } from "react";

export type Theme = "paper" | "ink" | "warm";

export const themes: { id: Theme; label: string; swatch: string }[] = [
  { id: "paper", label: "Paper", swatch: "#f7f6f2" },
  { id: "ink", label: "Ink", swatch: "#1a1815" },
  { id: "warm", label: "Warm", swatch: "#f1e4cb" },
];

const STORAGE_KEY = "mavern-theme";

// Keep in step with --desk in styles/themes.css.
const browserColor: Record<Theme, string> = { paper: "#e8e5de", ink: "#0f0e0c", warm: "#e3d3b6" };

function isTheme(value: unknown): value is Theme {
  return themes.some((t) => t.id === value);
}

// index.html sets data-theme before first paint; read it back here.
function initialTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : "paper";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", browserColor[theme]);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  }, [theme]);

  return { theme, setTheme };
}
