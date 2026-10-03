"use client";

import { api, type ArtifactKind, type ArtifactSummary } from "@/api";
import { useQuery } from "@/api/use-query";
import { ArtifactRow } from "@/components/home/artifact-row";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";

type Domain = "learn" | "start" | "validate" | "run" | "money" | "team" | "fund" | "reach";

const DOMAIN_OF: Record<ArtifactKind, Domain> = {
  explainer: "learn",
  profile: "start",
  legal: "start",
  launch: "start",
  idea: "validate",
  validation: "validate",
  market: "validate",
  entry: "reach",
  finance: "money",
  growth: "run",
  hiring: "team",
  proposal: "fund",
  accelerator: "fund",
};

const ORDER: Domain[] = ["learn", "start", "validate", "run", "money", "team", "fund", "reach"];

export function FileScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`file:${workspace.id}`, () => api.listArtifacts(workspace.id));

  const groups = ORDER.map((domain) => ({ domain, items: (data ?? []).filter((a: ArtifactSummary) => DOMAIN_OF[a.kind] === domain) })).filter((g) => g.items.length > 0);

  return (
    <Page eyebrow={workspace.name} title={t("file.title")}>
      <p className="max-w-2xl text-muted">{t("file.sub")}</p>
      {data && data.length === 0 ? (
        <EmptyState
          art="stamp"
          title={t("file.empty.title")}
          body={t("file.empty.body")}
          action={<ButtonLink href={`/w/${workspace.id}/talk`}>{t("home.talk")}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 laptop:grid-cols-2">
          {groups.map(({ domain, items }) => (
            <section key={domain} aria-labelledby={`dom-${domain}`} className="rounded-sheet bg-surface p-4 ring-1 ring-line">
              <h2 id={`dom-${domain}`} className="num mb-3 text-xs tracking-wide text-muted uppercase">
                {t(`file.domain.${domain}` as MessageId)}
              </h2>
              <ul className="ledger-rule">
                {items.map((artifact) => (
                  <li key={artifact.id} className="py-3 first:pt-0 last:pb-0">
                    <ArtifactRow artifact={artifact} wsId={workspace.id} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
