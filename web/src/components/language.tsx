"use client";

import { Languages } from "lucide-react";
import { useCallback, useEffect } from "react";

import { cn } from "@/lib/format";
import { LANGUAGES, translate, type MessageKey } from "@/lib/i18n";
import { languageStore, useStore } from "@/lib/store";
import type { Lang } from "@/lib/types";

export function useLang(): Lang {
  return useStore(languageStore);
}

export function useT() {
  const lang = useLang();
  return useCallback((key: MessageKey) => translate(lang, key), [lang]);
}

export function setLang(lang: Lang) {
  languageStore.set(lang);
}

/** Keeps <html lang> in step with the chosen language for screen readers. */
export function LanguageSync() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

export function LanguageSwitch({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const lang = useLang();
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-1 text-xs font-semibold ring-1",
        tone === "light" ? "bg-surface ring-line" : "bg-white/10 ring-white/20",
        className,
      )}
    >
      <Languages
        className={cn("mx-1.5 size-3.5", tone === "light" ? "text-subtle" : "text-white/60")}
        aria-hidden
      />
      {LANGUAGES.map((option) => {
        const active = option.id === lang;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            lang={option.id}
            title={option.english}
            onClick={() => setLang(option.id)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              active
                ? tone === "light"
                  ? "bg-navy-600 text-white"
                  : "bg-white text-navy-700"
                : tone === "light"
                  ? "text-muted hover:text-ink"
                  : "text-white/70 hover:text-white",
            )}
          >
            {option.id === "en" ? "EN" : option.id === "am" ? "አማ" : "OM"}
          </button>
        );
      })}
    </div>
  );
}
