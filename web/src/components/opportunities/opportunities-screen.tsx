"use client";

import Link from "next/link";
import { useState } from "react";

import { api, OPPORTUNITY_TYPES, PIPELINE_STAGES, type Opportunity, type OpportunityType } from "@/api";
import { useQuery } from "@/api/use-query";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { ScamFlag } from "@/components/ds/scam-flag";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

import { FundTabs } from "@/components/fund/fund-tabs";
import { DeadlineLine, EligibilityChip, StageSelect } from "./parts";

function OpportunityCard({ opportunity, wsId }: { opportunity: Opportunity; wsId: string }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <li className="rounded-sheet flex flex-col gap-3 bg-surface p-4 ring-1 ring-line">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Tag>{t(`opp.type.${opportunity.type}` as MessageId)}</Tag>
            <Tag>{t("opp.demo")}</Tag>
          </div>
          <h2 className="font-display text-lg leading-snug font-semibold">
            <Link href={`/w/${wsId}/opportunities/${opportunity.id}`} className="hover:underline">
              {opportunity.title}
            </Link>
          </h2>
          <p className="text-sm text-muted">{opportunity.provider}</p>
        </div>
        <EligibilityChip eligibility={opportunity.eligibility} />
      </div>
      <DeadlineLine opportunity={opportunity} />
      <p className="text-sm">
        <span className="text-muted">{t("opp.benefit")}: </span>
        <span className="font-semibold">{opportunity.benefit}</span>
      </p>
      {opportunity.fit.length > 0 && opportunity.eligibility.state !== "not" && (
        <ul className="flex list-disc flex-col gap-0.5 pl-5 text-sm text-muted">
          {opportunity.fit.map((reason, i) => (
            <li key={i}>{msg(reason)}</li>
          ))}
        </ul>
      )}
      <ScamFlag reasons={opportunity.scam.map((reason) => msg(reason))} />
      <p className="num text-xs text-muted">
        {t(`opp.kind.${opportunity.source.kind}` as MessageId)} · {opportunity.source.domain}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {opportunity.stage ? (
          <StageSelect value={opportunity.stage} onChange={(stage) => void api.setPipelineStage(wsId, opportunity.id, stage)} />
        ) : (
          <Button size="sm" disabled={opportunity.scam.length > 0} onClick={() => void api.setPipelineStage(wsId, opportunity.id, "found")}>
            {t("opp.add")}
          </Button>
        )}
        <ButtonLink href={`/w/${wsId}/opportunities/${opportunity.id}`} size="sm" variant="secondary">
          {t("opp.details")}
        </ButtonLink>
      </div>
    </li>
  );
}

function Matches({ wsId }: { wsId: string }) {
  const { t } = useI18n();
  const [type, setType] = useState<OpportunityType | "all">("all");
  const [closing, setClosing] = useState(false);
  const { data } = useQuery(`opps:${wsId}:${type}:${closing}`, () =>
    api.listOpportunities(wsId, { type: type === "all" ? undefined : type, closingSoon: closing || undefined }),
  );
  const eligible = (data ?? []).filter((o) => o.eligibility.state !== "not" && o.scam.length === 0);
  const flagged = (data ?? []).filter((o) => o.scam.length > 0);
  const notEligible = (data ?? []).filter((o) => o.eligibility.state === "not" && o.scam.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t("opp.filter.type")}</span>
          <select value={type} onChange={(event) => setType(event.target.value as OpportunityType | "all")} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
            <option value="all">{t("opp.filter.all")}</option>
            {OPPORTUNITY_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`opp.type.${value}` as MessageId)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={closing} onChange={(event) => setClosing(event.target.checked)} className="size-5 accent-stamp" />
          {t("opp.filter.closing")}
        </label>
      </div>

      {data && eligible.length === 0 && flagged.length === 0 ? (
        <EmptyState
          art="checklist"
          title={t("opp.empty.title")}
          body={t("opp.empty.body")}
          action={<ButtonLink href={`/w/${wsId}/talk`}>{t("opp.empty.talk")}</ButtonLink>}
        />
      ) : (
        <ul className="grid items-start gap-4 laptop:grid-cols-2">
          {eligible.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} wsId={wsId} />
          ))}
        </ul>
      )}

      {flagged.length > 0 && (
        <ul className="grid items-start gap-4 laptop:grid-cols-2">
          {flagged.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} wsId={wsId} />
          ))}
        </ul>
      )}

      {notEligible.length > 0 && (
        <details className="rounded-sheet bg-surface ring-1 ring-line">
          <summary className="min-h-12 cursor-pointer px-4 py-3 font-semibold">{t("opp.notEligible", { n: notEligible.length })}</summary>
          <ul className="grid items-start gap-4 p-4 pt-0 laptop:grid-cols-2">
            {notEligible.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} wsId={wsId} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function PipelineBoard({ wsId }: { wsId: string }) {
  const { t } = useI18n();
  const { data } = useQuery(`pipeline:${wsId}`, () => api.listOpportunities(wsId));
  const inPipeline = (data ?? []).filter((o) => o.stage);
  if (data && inPipeline.length === 0) {
    return <EmptyState art="tray" title={t("opp.pipeline.empty")} body={t("opp.pipeline.body")} />;
  }
  return (
    <div className="grid items-start gap-4 tablet:grid-cols-2 desktop:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => {
        const items = inPipeline.filter((o) => o.stage === stage).sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));
        return (
          <section key={stage} aria-labelledby={`stage-${stage}`} className={cn("flex flex-col gap-2.5", items.length === 0 && "max-tablet:hidden")}>
            <h2 id={`stage-${stage}`} className="num flex items-center gap-2 text-xs tracking-wide text-muted uppercase">
              {t(`pipe.${stage}` as MessageId)}
              <span className="rounded-full bg-ink/8 px-1.5">{items.length}</span>
            </h2>
            <ul className="flex flex-col gap-2.5">
              {items.map((o) => (
                <li key={o.id} className="rounded-sheet flex flex-col gap-2 bg-surface p-3.5 ring-1 ring-line">
                  <Link href={`/w/${wsId}/opportunities/${o.id}`} className="leading-snug font-semibold hover:underline">
                    {o.title}
                  </Link>
                  <DeadlineLine opportunity={o} />
                  <StageSelect value={o.stage} onChange={(next) => void api.setPipelineStage(wsId, o.id, next)} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function OpportunitiesScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const [tab, setTab] = useState<"matches" | "pipeline">("matches");
  return (
    <Page eyebrow={workspace.name} title={t("opp.title")} wide>
      <FundTabs />
      <p className="max-w-2xl text-muted">{t("opp.sub")}</p>
      <div role="tablist" aria-label={t("opp.title")} className="flex w-fit gap-1 rounded-full p-0.5 ring-1 ring-line-strong">
        {(["matches", "pipeline"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("min-touch rounded-full px-5 text-sm font-semibold", tab === id ? "bg-stamp text-on-stamp" : "text-muted")}
          >
            {t(`opp.tab.${id}` as MessageId)}
          </button>
        ))}
      </div>
      {tab === "matches" ? <Matches wsId={workspace.id} /> : <PipelineBoard wsId={workspace.id} />}
    </Page>
  );
}
