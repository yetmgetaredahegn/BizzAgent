"use client";

import { CalendarPlus, ClipboardList, Flag, UserCheck } from "lucide-react";
import { useState } from "react";

import { api, type ArtifactDetail, type ExplainerClause } from "@/api";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

type Explainer = Extract<ArtifactDetail, { kind: "explainer" }>;

const ACTION_ICON = { calendar: CalendarPlus, expert: UserCheck, task: ClipboardList } as const;

function ClauseCard({ wsId, artifactId, clause, active, onFocus }: { wsId: string; artifactId: string; clause: ExplainerClause; active: boolean; onFocus: () => void }) {
  const { t } = useI18n();
  const msg = useMsg();
  const Icon = clause.action ? ACTION_ICON[clause.action] : null;
  return (
    <li
      id={`exp-${clause.id}`}
      onMouseEnter={onFocus}
      className={cn("rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1", active ? "ring-2 ring-stamp" : "ring-line")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{t(`ex.kind.${clause.kind}` as MessageId)}</Tag>
        {clause.redFlag && (
          <span className="rounded-stamp inline-flex items-center gap-1 bg-meskel px-1.5 text-[11px] font-semibold tracking-wide text-on-meskel uppercase">
            <Flag className="size-3" aria-hidden /> {t("ex.flag")}
          </span>
        )}
        <span className="num text-xs text-muted">{t("ex.page", { n: clause.page })}</span>
      </div>
      <p className="leading-snug font-semibold">{msg(clause.explanation)}</p>
      <blockquote className="border-l-2 border-line-strong pl-3 text-sm text-muted">“{clause.quote}”</blockquote>
      {clause.action && Icon && (
        clause.done ? (
          <p className="num text-sm text-established">✓ {t(`ex.done.${clause.done}` as MessageId)}</p>
        ) : (
          <Button size="sm" variant="secondary" className="w-fit" onClick={() => void api.explainerAction(wsId, artifactId, clause.id, clause.action!)}>
            <Icon className="size-4" aria-hidden /> {t(`ex.action.${clause.action}` as MessageId)}
          </Button>
        )
      )}
    </li>
  );
}

export function ExplainerView({ wsId, artifact }: { wsId: string; artifact: Explainer }) {
  const { t } = useI18n();
  const msg = useMsg();
  const [active, setActive] = useState<string | null>(null);
  const flagged = artifact.clauses.filter((c) => c.redFlag).length;
  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <p>{msg(artifact.summary)}</p>
        <p className="num mt-2 text-sm text-muted">{t("ex.flags")}: {flagged}</p>
        <p className="mt-1 text-sm text-muted">{t("ex.notAdvice")}</p>
      </Panel>
      <div className="grid items-start gap-5 laptop:grid-cols-2">
        <section aria-label={t("ex.document")}>
          <div className="rounded-stamp bg-surface p-5 shadow-card ring-1 ring-line">
            <h2 className="num mb-3 text-xs tracking-wide text-muted uppercase">{artifact.document}</h2>
            <div className="flex flex-col gap-3 font-serif leading-relaxed">
              {artifact.clauses.map((clause) => (
                <p key={clause.id}>
                  <a
                    href={`#exp-${clause.id}`}
                    onFocus={() => setActive(clause.id)}
                    onMouseEnter={() => setActive(clause.id)}
                    className={cn(
                      "rounded-stamp px-0.5",
                      clause.redFlag ? "bg-meskel/50 underline decoration-2 underline-offset-2" : "underline decoration-dotted underline-offset-2",
                      active === clause.id && "ring-2 ring-stamp",
                    )}
                  >
                    {clause.quote}
                    {clause.redFlag && <span className="sr-only"> ({t("ex.flag")})</span>}
                  </a>
                </p>
              ))}
            </div>
          </div>
        </section>
        <ol className="flex flex-col gap-3">
          {artifact.clauses.map((clause) => (
            <ClauseCard key={clause.id} wsId={wsId} artifactId={artifact.id} clause={clause} active={active === clause.id} onFocus={() => setActive(clause.id)} />
          ))}
        </ol>
      </div>
    </div>
  );
}
