"use client";

import { ShieldAlert } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

/** ScamFlag: a warning stamp plus the reasons. Never just an icon. */
export function ScamFlag({ reasons, className }: { reasons: string[]; className?: string }) {
  const { t } = useI18n();
  if (reasons.length === 0) return null;
  return (
    <div role="note" className={cn("rounded-stamp flex flex-col gap-1.5 bg-surface p-3 text-sm ring-1 ring-contradictory", className)}>
      <strong className="flex items-center gap-1.5 text-contradictory">
        <ShieldAlert className="size-4" aria-hidden /> {t("scam.title")}
      </strong>
      <ul className="list-disc pl-5">
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p className="text-xs text-muted">{t("scam.note")}</p>
    </div>
  );
}
