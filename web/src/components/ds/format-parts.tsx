"use client";

import { useI18n } from "@/i18n";
import { formatDual, type DateOrder } from "@/lib/ethiopian-calendar";
import { cn } from "@/lib/format";
import { dateOrderStore, useStore } from "@/lib/store";

/** DualDate: "21 Meskerem 2019 EC · 1 Oct 2026" from an ISO date, in the user's language and order. */
export function DualDate({ iso, className }: { iso: string; className?: string }) {
  const { lang } = useI18n();
  const order: DateOrder = useStore(dateOrderStore);
  return (
    <time dateTime={iso} lang={lang} className={cn("num", className)}>
      {formatDual(iso, lang, order)}
    </time>
  );
}

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** BirrAmount: "Br 12,500" / "ብር 12,500" with tabular figures. Negatives use a real minus sign. */
export function BirrAmount({ amount, className }: { amount: number; className?: string }) {
  const { lang } = useI18n();
  const unit = lang === "am" ? "ብር" : "Br";
  const sign = amount < 0 ? "−" : "";
  return (
    <span className={cn("num whitespace-nowrap", className)}>
      <span lang={lang === "am" ? "am" : undefined} className={lang === "am" ? "font-ethiopic" : undefined}>
        {unit}
      </span>{" "}
      {sign}
      {nf.format(Math.abs(amount))}
    </span>
  );
}
