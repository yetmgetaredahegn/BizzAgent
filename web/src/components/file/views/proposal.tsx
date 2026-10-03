"use client";

import type { ArtifactDetail } from "@/api";
import { Panel } from "@/components/ds/page";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";

type Proposal = Extract<ArtifactDetail, { kind: "proposal" }>;

export function ProposalView({ artifact }: { artifact: Proposal }) {
  const { t } = useI18n();
  return (
    <Panel>
      <dl className="ledger-rule">
        <div className="flex flex-wrap justify-between gap-2 py-3 first:pt-0">
          <dt className="num text-xs tracking-wide text-muted uppercase">{t("pr.funder")}</dt>
          <dd className="font-semibold">{artifact.funder}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-3">
          <dt className="num text-xs tracking-wide text-muted uppercase">{t("pr.call")}</dt>
          <dd className="font-semibold">{artifact.call}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-3 last:pb-0">
          <dt className="num text-xs tracking-wide text-muted uppercase">{t("pr.gaps", { n: artifact.gaps })}</dt>
        </div>
      </dl>
      <p className="mt-2 text-sm text-muted">{t("pr.note")}</p>
      <ButtonLink href={artifact.href} className="mt-3 w-fit">
        {t("pr.open")}
      </ButtonLink>
    </Panel>
  );
}
