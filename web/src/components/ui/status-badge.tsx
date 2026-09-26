"use client";

import { CircleDashed, MessageCircle, ShieldCheck, TriangleAlert } from "lucide-react";

import { useLang } from "@/components/language";
import { cn } from "@/lib/format";
import { statusKey, translate } from "@/lib/i18n";
import type { FieldStatus } from "@/lib/types";

export const STATUS_STYLE: Record<
  FieldStatus,
  { className: string; dot: string; Icon: typeof ShieldCheck; hint: string }
> = {
  established: {
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
    Icon: ShieldCheck,
    hint: "Backed by a document or photo.",
  },
  unverified: {
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-400",
    Icon: MessageCircle,
    hint: "Said by the applicant, not yet backed by a document.",
  },
  missing: {
    className: "bg-slate-50 text-slate-600",
    dot: "bg-slate-300",
    Icon: CircleDashed,
    hint: "Not established. Left empty rather than guessed.",
  },
  contradictory: {
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    Icon: TriangleAlert,
    hint: "Two pieces of evidence disagree.",
  },
};

export function StatusBadge({
  status,
  localized = false,
  size = "sm",
  className,
}: {
  status: FieldStatus;
  /** Show the label in the applicant's chosen language. */
  localized?: boolean;
  size?: "xs" | "sm";
  className?: string;
}) {
  const lang = useLang();
  const { className: tone, Icon, hint } = STATUS_STYLE[status];
  const label = translate(localized ? lang : "en", statusKey(status));
  return (
    <span
      title={hint}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ring-1 ring-inset",
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        status === "missing" && "border border-dashed border-slate-300 ring-0",
        tone,
        className,
      )}
    >
      <Icon className={size === "xs" ? "size-3" : "size-3.5"} aria-hidden />
      {label}
    </span>
  );
}
