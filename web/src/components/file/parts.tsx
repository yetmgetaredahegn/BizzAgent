"use client";

import { FileSearch } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ArtifactDetail, ChecklistItem, Citation, FieldStatusCounts } from "@/api";
import { CitationSlip } from "@/components/ds/citation-slip";
import { DualDate } from "@/components/ds/format-parts";
import { EvidenceStamp, StampRing } from "@/components/ds/evidence-stamp";
import { Page } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

const STATUSES = ["established", "unverified", "missing", "contradictory"] as const;

export function StampCounts({ stamps, className }: { stamps: FieldStatusCounts; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {STATUSES.map((status) =>
        stamps[status] > 0 ? (
          <span key={status} className="num flex items-center gap-1 text-xs text-muted" title={t(`status.${status}`)}>
            <StampRing status={status} className="size-4" />
            {stamps[status]} <span className="sr-only">{t(`status.${status}`)}</span>
          </span>
        ) : null,
      )}
    </span>
  );
}

/** Title block shared by every artifact view: name, version, who made it and how complete it is. */
export function ArtifactFrame({ wsId, artifact, children, actions }: { wsId: string; artifact: ArtifactDetail; children: ReactNode; actions?: ReactNode }) {
  const { t } = useI18n();
  return (
    <Page
      eyebrow={
        <Link href={`/w/${wsId}/file`} className="hover:underline">
          ← {t("file.title")}
        </Link>
      }
      title={artifact.title}
      actions={
        <>
          {actions}
          <ButtonLink href={`/w/${wsId}/documents`} variant="secondary" size="sm">
            {t("af.export")}
          </ButtonLink>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span className="num">{t("home.version", { n: artifact.version })}</span>
        <span className="flex items-center gap-1">
          {t("af.updated")} <DualDate iso={artifact.updatedAt} />
        </span>
        {artifact.producedBy && (
          <span>
            {t("af.by", { agent: t(`agent.${artifact.producedBy.agent}` as MessageId) })}
          </span>
        )}
        <StampCounts stamps={artifact.stamps} />
      </div>
      {children}
    </Page>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="num text-xs tracking-wide text-muted uppercase">{children}</h2>
      {aside}
    </div>
  );
}

/** A citation, or an honest "no verified answer": never a guess. */
export function CitationOrNone({ citation }: { citation: Citation | null }) {
  const { t } = useI18n();
  if (!citation) {
    return (
      <p className="rounded-stamp flex items-center gap-1.5 bg-meskel/25 px-2 py-1 text-sm text-ink">
        <FileSearch className="size-4 shrink-0" aria-hidden /> {t("af.noAnswer")}
      </p>
    );
  }
  return (
    <CitationSlip title={citation.title} origin={citation.origin} retrieved={citation.retrieved} unverified={!citation.verified}>
      {citation.demo && <Tag className="mt-1">{t("af.demo")}</Tag>}
    </CitationSlip>
  );
}

export function Checklist({ items, onToggle }: { items: ChecklistItem[]; onToggle: (id: string, done: boolean) => void }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <ul className="ledger-rule">
      {items.map((item) => (
        <li key={item.id} className="grid gap-2 py-3 tablet:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] tablet:gap-5">
          <label className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              checked={item.done}
              onChange={(event) => onToggle(item.id, event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-stamp"
            />
            <span className="min-w-0">
              <span className={cn("block leading-snug font-semibold", item.done && "text-muted line-through")}>{msg(item.text)}</span>
              <span className="mt-1 flex items-center gap-2">
                <EvidenceStamp status={item.status} compact />
              </span>
            </span>
          </label>
          <CitationOrNone citation={item.citation} />
        </li>
      ))}
      {items.length === 0 && <li className="py-3 text-muted">{t("af.none")}</li>}
    </ul>
  );
}
