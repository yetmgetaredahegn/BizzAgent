"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/format";
import { useI18n } from "@/i18n";

/** The seven orders of the fidel chart: ሀ ሁ ሂ ሃ ሄ ህ ሆ. One per journey stage. */
const ORDERS = ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ"] as const;
export const STAGES = ["idea", "validated", "formalised", "operating", "growing", "funded", "expanding"] as const;
export type Stage = (typeof STAGES)[number];

/** FidelJourney: the 7-stage journey as a row of cells; the current cell is filled with stamp ink. */
export function FidelJourney({ stage, className }: { stage: Stage; className?: string }) {
  const { t } = useI18n();
  const now = STAGES.indexOf(stage);
  return (
    <ol
      className={cn("no-scrollbar flex gap-1 overflow-x-auto @container", className)}
      aria-label={t("journey.label")}
    >
      {STAGES.map((id, i) => (
        <li
          key={id}
          aria-current={i === now ? "step" : undefined}
          className={cn(
            "rounded-stamp flex min-h-16 min-w-[5.25rem] flex-1 flex-col justify-between border p-2",
            i === now
              ? "border-stamp bg-stamp text-on-stamp"
              : i < now
                ? "border-line-strong bg-surface"
                : "border-line bg-surface text-muted",
          )}
        >
          <span className="flex items-center justify-between">
            <span lang="am" className="text-lg leading-none font-bold">
              {ORDERS[i]}
            </span>
            {i < now && <Check className="size-3.5" aria-hidden />}
          </span>
          <span className="text-xs leading-tight">{t(`journey.${id}`)}</span>
        </li>
      ))}
    </ol>
  );
}
