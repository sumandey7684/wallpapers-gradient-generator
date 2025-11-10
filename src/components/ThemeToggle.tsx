"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";

function getInitialTheme(): "light" | "dark" | "system" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    let applied: "light" | "dark";
    if (theme === "system") {
      applied = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } else {
      applied = theme;
    }
    document.documentElement.setAttribute("data-theme", applied);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeSwitcher
      value={theme}
      onChange={(t) => setTheme(t)}
      defaultValue={getInitialTheme()}
    />
  );
}
