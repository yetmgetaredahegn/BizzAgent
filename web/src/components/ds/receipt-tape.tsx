import type { ReactNode } from "react";

import { cn } from "@/lib/format";

export interface TapeLine {
  label: ReactNode;
  /** Operator shown in its own column: + − × ÷ = */
  op?: "+" | "−" | "×" | "÷" | "=";
  value: string;
  /** Where the input came from, e.g. "you said (unverified)". */
  source?: ReactNode;
}

/**
 * ReceiptTape: a calculation trace as numbered monospace lines, an operator
 * column and a total under an accounting double underline. Torn bottom edge.
 */
export function ReceiptTape({
  lines,
  total,
  caption,
  className,
}: {
  lines: TapeLine[];
  total: { label: ReactNode; value: string };
  caption: string;
  className?: string;
}) {
  return (
    <div className={cn("edge-torn-bottom bg-surface px-4 pt-3.5 pb-6 @container", className)}>
      <table className="num w-full text-[14px] leading-6">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td className="w-6 pr-2 align-top text-muted">{i + 1}</td>
              <td className="pr-2 align-top font-sans">
                {line.label}
                {line.source && <div className="font-sans text-xs text-muted">{line.source}</div>}
              </td>
              <td className="w-6 text-center align-top text-muted">{line.op ?? ""}</td>
              <td className="text-right align-top whitespace-nowrap">{line.value}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td />
            <td className="border-t border-ink pt-1.5 font-sans">{total.label}</td>
            <td className="border-t border-ink pt-1.5 text-center text-muted">=</td>
            <td className="border-t border-ink pt-1.5 text-right whitespace-nowrap">
              <span className="border-b-[3px] border-double border-ink">{total.value}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
