"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { useI18n } from "@/i18n";
import { GLOSSARY, type GlossaryEntry, type TermId } from "@/lib/glossary";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/format";

/**
 * TermTooltip: a dotted underline on a business term; on tap, a 1–2 sentence
 * plain definition in the user's language, with a "listen" button.
 */
export function TermTooltip({ term, children }: { term: TermId; children?: ReactNode }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const id = useId();
  const box = useRef<HTMLSpanElement>(null);
  const entry: GlossaryEntry = GLOSSARY[term];
  const translated = entry.def[lang];
  const text = translated ?? entry.def.en;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={box} className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-4"
      >
        {children ?? entry.label[lang] ?? entry.label.en}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "rounded-sheet absolute top-full left-0 z-30 mt-2 flex w-72 max-w-[85vw] flex-col gap-2 bg-surface p-3 text-left text-sm font-normal text-ink shadow-sheet ring-1 ring-line",
          )}
        >
          <span>{text}</span>
          {!translated && <span className="text-xs text-muted">{t("term.pending")}</span>}
          <button
            type="button"
            onClick={() => speak(text, translated ? lang : "en")}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-stamp"
          >
            <Volume2 className="size-4" aria-hidden /> {t("term.listen")}
          </button>
        </span>
      )}
    </span>
  );
}
