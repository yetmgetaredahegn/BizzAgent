"use client";

import type { CalcResultDto } from "@/api";
import { ReceiptTape, type TapeLine } from "@/components/ds/receipt-tape";
import { useI18n, type MessageId } from "@/i18n";
import { formatCalcValue } from "@/lib/format-calc";

/** A calculation result from `lib/calc` as a ReceiptTape: every figure can be traced line by line. */
export function CalcTape({ result, inputSource }: { result: CalcResultDto; inputSource?: string }) {
  const { t } = useI18n();
  const steps = result.steps;
  const total = steps[steps.length - 1];
  const lines: TapeLine[] = steps.slice(0, -1).map((step) => ({
    label: t(step.label as MessageId),
    op: step.op,
    value: formatCalcValue(step.value, step.unit),
    source: step.input && inputSource ? inputSource : undefined,
  }));
  return (
    <div className="flex flex-col gap-2">
      <ReceiptTape
        caption={t("calc.caption")}
        lines={lines}
        total={{ label: t(total.label as MessageId), value: formatCalcValue(total.value, total.unit) }}
      />
      {result.warnings.map((warning) => (
        <p key={warning} role="note" className="text-sm font-semibold text-contradictory">
          {t(warning as MessageId)}
        </p>
      ))}
    </div>
  );
}
