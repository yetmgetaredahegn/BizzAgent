"use client";

import Link from "next/link";

import type { ArtifactSummary } from "@/api";
import { StampRing } from "@/components/ds/evidence-stamp";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

/** Row for an artifact: title, version, completeness and stamp counts. */
export function ArtifactRow({ artifact, wsId, compact = false }: { artifact: ArtifactSummary; wsId: string; compact?: boolean }) {
  const { t } = useI18n();
  const { stamps } = artifact;
  return (
    <Link href={`/w/${wsId}/file/${artifact.kind}/${artifact.id}`} className="group flex flex-col gap-1.5">
      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
        <strong className="min-w-0 leading-snug group-hover:underline">{artifact.title}</strong>
        <span className="num text-xs text-muted">{t("home.version", { n: artifact.version })}</span>
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(artifact.completeness * 100)}
          className={cn("block h-1.5 overflow-hidden rounded-full bg-line", compact ? "w-20" : "w-32")}
        >
          <span className="block h-full bg-stamp" style={{ width: `${artifact.completeness * 100}%` }} />
        </span>
        {(["established", "unverified", "missing", "contradictory"] as const).map((status) =>
          stamps[status] > 0 ? (
            <span key={status} className="num flex items-center gap-1 text-xs text-muted" title={t(`status.${status}`)}>
              <StampRing status={status} className="size-4" />
              {stamps[status]}
            </span>
          ) : null,
        )}
      </span>
    </Link>
  );
}
