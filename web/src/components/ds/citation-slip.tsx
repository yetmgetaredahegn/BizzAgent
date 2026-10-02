"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

/** CitationSlip: a source card styled as a torn receipt slip (title, where it is from, when it was retrieved). */
export function CitationSlip({
  title,
  origin,
  retrieved,
  unverified = false,
  href,
  className,
  children,
}: {
  title: string;
  /** Domain or pack entry id, e.g. "knowledge · et.registration.overview". */
  origin: string;
  retrieved?: string;
  unverified?: boolean;
  href?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("edge-torn-top flex flex-col gap-1 bg-surface px-4 pt-5 pb-3.5 text-sm", className)}>
      <strong className="leading-snug">{title}</strong>
      <span className="num text-xs text-muted">
        {origin}
        {retrieved && ` · ${t("source.retrieved", { date: retrieved })}`}
      </span>
      {unverified && (
        <span className="rounded-stamp bg-meskel text-on-meskel w-fit px-1.5 text-xs font-semibold">
          {t("source.unverified")}
        </span>
      )}
      {children}
      {href && (
        <a
          href={href}
          className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold text-stamp underline-offset-2 hover:underline"
        >
          {t("source.open")} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}
