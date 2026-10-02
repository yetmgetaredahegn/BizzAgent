"use client";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

import { Button } from "../ui/button";

export interface CostEstimate {
  action: string;
  creditsMin: number;
  creditsMax: number;
  balanceAfter: number;
  capRemaining: number | null;
}

/**
 * CostTicket: the pay-as-you-go estimate shown before a paid action, like a
 * minibus ticket stub. Over the cap it blocks and points to top-up.
 */
export function CostTicket({
  estimate,
  onConfirm,
  onCancel,
  confirmLabel,
  className,
}: {
  estimate: CostEstimate;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const blocked = estimate.balanceAfter < 0 || (estimate.capRemaining != null && estimate.capRemaining < estimate.creditsMax);
  const range =
    estimate.creditsMin === estimate.creditsMax
      ? String(estimate.creditsMin)
      : `${estimate.creditsMin}–${estimate.creditsMax}`;
  return (
    <div className={cn("rounded-stamp grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden bg-surface ring-1 ring-line", className)}>
      <div className="flex flex-col gap-1.5 border-r-2 border-dashed border-line-strong p-3.5">
        <strong className="leading-snug">{estimate.action}</strong>
        <span className="text-xs text-muted">{blocked ? t("cost.overCap") : t("cost.onlyIfDone")}</span>
        {(onConfirm || onCancel) && (
          <div className="mt-1 flex flex-wrap gap-2">
            {onConfirm && (
              <Button size="sm" onClick={onConfirm} disabled={blocked}>
                {confirmLabel ?? t("action.confirm")}
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="secondary" onClick={onCancel}>
                {t("action.cancel")}
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="flex min-w-24 flex-col items-center justify-center gap-0.5 px-3 py-3.5 text-center">
        <span className="num text-xs text-muted uppercase">{t("cost.credits")}</span>
        <span className="font-display num text-[28px] leading-none font-bold">{range}</span>
        <span className="num text-xs text-muted">
          {t("cost.balanceAfter")} {estimate.balanceAfter}
        </span>
      </div>
    </div>
  );
}
