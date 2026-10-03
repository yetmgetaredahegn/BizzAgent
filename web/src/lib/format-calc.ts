import type { CalcStepDto } from "@/api";

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Formats a calculation value for the ReceiptTape: birr and counts plain, percent with one decimal. */
export function formatCalcValue(value: number, unit: CalcStepDto["unit"] = "birr"): string {
  if (unit === "percent") return `${value.toFixed(1)} %`;
  if (unit === "count" || unit === "months") return String(Math.round(value));
  return nf.format(value);
}
