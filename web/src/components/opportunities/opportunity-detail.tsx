"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { api } from "@/api";
import { useQuery } from "@/api/use-query";
import { CitationSlip } from "@/components/ds/citation-slip";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Page, Panel } from "@/components/ds/page";
import { ErrorState } from "@/components/ds/states";
import { ScamFlag } from "@/components/ds/scam-flag";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";

import { DeadlineLine, EligibilityChip, StageSelect } from "./parts";

export function OpportunityDetail() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const params = useParams<{ id: string }>();
  const wsId = workspace.id;
  const { data, error, loading } = useQuery(`opp:${wsId}:${params.id}`, () => api.getOpportunity(wsId, params.id));
  const [reported, setReported] = useState(false);

  if (error) {
    return (
      <Page>
        <ErrorState title={t("af.notfound.title")} body={t("af.notfound.body")} />
        <ButtonLink href={`/w/${wsId}/opportunities`} variant="secondary" className="w-fit">
          {t("opp.back")}
        </ButtonLink>
      </Page>
    );
  }
  if (loading || !data) return <Page>{null}</Page>;

  const prepareHref = data.onPlatform && data.type === "grant_call" ? `/w/${wsId}/funding` : `/w/${wsId}/common-application`;
  return (
    <Page
      eyebrow={
        <Link href={`/w/${wsId}/opportunities`} className="hover:underline">
          ← {t("opp.back")}
        </Link>
      }
      title={data.title}
      actions={
        data.stage ? (
          <StageSelect value={data.stage} onChange={(stage) => void api.setPipelineStage(wsId, data.id, stage)} />
        ) : (
          <Button disabled={data.scam.length > 0} onClick={() => void api.setPipelineStage(wsId, data.id, "found")}>
            {t("opp.add")}
          </Button>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{t(`opp.type.${data.type}` as MessageId)}</Tag>
        <Tag>{t("opp.demo")}</Tag>
        <span className="text-sm text-muted">{data.provider}</span>
      </div>

      <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel>
            <dl className="ledger-rule">
              <div className="py-3 first:pt-0">
                <dt className="num text-xs tracking-wide text-muted uppercase">{t("opp.deadline")}</dt>
                <dd>
                  <DeadlineLine opportunity={data} />
                </dd>
              </div>
              <div className="py-3">
                <dt className="num text-xs tracking-wide text-muted uppercase">{t("opp.benefit")}</dt>
                <dd className="font-semibold">{data.benefit}</dd>
              </div>
              <div className="py-3 last:pb-0">
                <dt className="num text-xs tracking-wide text-muted uppercase">{t("opp.d.languages")}</dt>
                <dd>{data.languages.map((l) => ({ en: "English", am: "አማርኛ", om: "Afaan Oromoo" })[l]).join(" · ")}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title={t("opp.d.why")}>
            <EligibilityChip eligibility={data.eligibility} />
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
              {data.eligibility.reasons.map((reason, i) => (
                <li key={i}>{msg(reason)}</li>
              ))}
            </ul>
            {data.eligibility.confirm.length > 0 && (
              <p className="mt-3 text-sm">
                <span className="num mr-1.5 text-xs tracking-wide text-muted uppercase">{t("opp.d.confirm")}</span>
                {data.eligibility.confirm.map((c) => msg(c)).join(", ")}
              </p>
            )}
          </Panel>

          <Panel title={t("opp.d.requirements")}>
            <p className="mb-2 text-sm text-muted">{t("opp.d.requirements.note")}</p>
            <ul className="ledger-rule">
              {data.requirements.map((req) => (
                <li key={req.kind} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  {req.artifactId ? (
                    <Link href={`/w/${wsId}/file/${req.kind}/${req.artifactId}`} className="font-semibold hover:underline">
                      {msg(req.text)}
                    </Link>
                  ) : (
                    <span className="font-semibold">{msg(req.text)}</span>
                  )}
                  <EvidenceStamp status={req.status} />
                </li>
              ))}
            </ul>
            {data.eligibility.state !== "not" && data.scam.length === 0 && (
              <ButtonLink href={prepareHref} className="mt-3 w-fit">
                {t("opp.d.prepare")}
              </ButtonLink>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <ScamFlag reasons={data.scam.map((reason) => msg(reason))} />
          <p className="text-sm text-muted">{t("opp.d.guidance")}</p>
          <CitationSlip title={data.title} origin={data.source.domain} retrieved={data.source.retrieved} unverified={data.source.kind !== "platform"}>
            <p className="text-xs text-muted">{t(`opp.kind.${data.source.kind}` as MessageId)}</p>
          </CitationSlip>
          {data.source.kind === "discovered" && <p className="text-sm text-muted">{t("opp.d.discoveredNote")}</p>}
          {reported ? (
            <p role="status" className="text-sm font-semibold text-established">
              {t("opp.d.reported")}
            </p>
          ) : (
            <Button
              variant="secondary"
              className="w-fit"
              onClick={async () => {
                await api.reportOpportunity(wsId, data.id);
                setReported(true);
              }}
            >
              {t("opp.d.report")}
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}
