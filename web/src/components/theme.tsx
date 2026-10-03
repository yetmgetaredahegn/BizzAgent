"use client";

import { useEffect } from "react";

import { themeStore, useStore, type ThemeChoice } from "@/lib/store";

export function useTheme(): ThemeChoice {
  return useStore(themeStore);
}

export function setTheme(theme: ThemeChoice) {
  themeStore.set(theme);
}

/** Mirrors the chosen theme onto <html data-theme>. Light is the default; "system" follows the device. */
export function ThemeSync() {
  const theme = useTheme();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
