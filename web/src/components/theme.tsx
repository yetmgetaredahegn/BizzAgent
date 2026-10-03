"use client";

import { useEffect } from "react";

import { themeStore, useStore, type ThemeChoice } from "@/lib/store";

export function useTheme(): ThemeChoice {
  return useStore(themeStore);
}

export function setTheme(theme: ThemeChoice) {
  themeStore.set(theme);
}

/** Mirrors the chosen theme onto <html data-theme>; "system" leaves it unset. */
export function ThemeSync() {
  const theme = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
