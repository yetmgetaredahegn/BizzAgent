"use client";

import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";
import type { FieldStatus } from "@/lib/types";

const COLOR: Record<FieldStatus, string> = {
  established: "text-established",
  unverified: "text-unverified",
  missing: "text-missing",
  contradictory: "text-contradictory",
};

const LABEL: Record<FieldStatus, MessageId> = {
  established: "status.established",
  unverified: "status.unverified",
  missing: "status.missing",
  contradictory: "status.contradictory",
};

/** The ring for one provenance state. Shape and icon carry the meaning; colour only reinforces it. */
export function StampRing({ status, className }: { status: FieldStatus; className?: string }) {
  return (
    <svg viewBox="0 0 26 26" className={cn("size-[22px] shrink-0", COLOR[status], className)} aria-hidden>
      {status === "established" && (
        <>
          <circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="13" cy="13" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M9 13.2l2.6 2.6L17 10.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {status === "unverified" && (
        <>
          <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3.2 2.6" />
          <text x="13" y="17.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
            ?
          </text>
        </>
      )}
      {status === "missing" && (
        <>
          <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M9 13h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {status === "contradictory" && (
        <>
          <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5 9l16 8M5 12l16 8" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

/**
 * EvidenceStamp: ring + label for a field's provenance. `pressed` plays the
 * 140 ms stamp press once (the product's one orchestrated motion).
 */
export function EvidenceStamp({
  status,
  source,
  compact = false,
  pressed = false,
  className,
}: {
  status: FieldStatus;
  /** Plain-language source, used for the accessible name, e.g. "licence photo". */
  source?: string;
  compact?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const label = t(LABEL[status]);
  return (
    <span
      role="img"
      aria-label={source ? `${label}: ${source}` : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold",
        COLOR[status],
        !compact && "py-0.5 pr-2.5 pl-0.5 ring-1 ring-current/40",
        pressed && "animate-press",
        className,
      )}
    >
      <StampRing status={status} />
      {!compact && <span aria-hidden>{label}</span>}
    </span>
  );
}
