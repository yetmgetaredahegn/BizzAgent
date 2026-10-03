"use client";

import { api, type ArtifactDetail } from "@/api";
import { CarbonSheet } from "@/components/ds/carbon";
import { Panel } from "@/components/ds/page";
import { ButtonLink } from "@/components/ui/button";
import { useWorkspace } from "@/components/shell/workspace-context";
import { useI18n, useMsg } from "@/i18n";

import { Checklist, SectionTitle } from "../parts";

type Legal = Extract<ArtifactDetail, { kind: "legal" }>;
type Launch = Extract<ArtifactDetail, { kind: "launch" }>;

function useToggle(wsId: string, artifactId: string) {
  return (itemId: string, done: boolean) => void api.toggleChecklistItem(wsId, artifactId, itemId, done);
}

export function LegalView({ wsId, artifact }: { wsId: string; artifact: Legal }) {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const toggle = useToggle(wsId, artifact.id);
  return (
    <div className="flex flex-col gap-5">
      <CarbonSheet role="draft" edgeLabel={t("lg.suggestion")} active>
        <h2 className="num text-xs tracking-wide text-muted uppercase">{t("lg.suggested")}</h2>
        <p className="font-display mt-1 text-2xl font-bold">{t(`ob.form.${artifact.form}` as never)}</p>
        <h3 className="num mt-3 text-xs tracking-wide text-muted uppercase">{t("lg.because")}</h3>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
          {artifact.reasons.map((reason, i) => (
            <li key={i}>{msg(reason)}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">{t("lg.notAdvice")}</p>
        <ButtonLink href={`/w/${workspace.id}/talk?topic=setup`} variant="secondary" size="sm" className="mt-3">
          {t("lg.askAdvisor")}
        </ButtonLink>
      </CarbonSheet>
      <Panel title={t("lg.steps")}>
        <Checklist items={artifact.steps} onToggle={toggle} />
      </Panel>
    </div>
  );
}

export function LaunchView({ wsId, artifact }: { wsId: string; artifact: Launch }) {
  const { t } = useI18n();
  const toggle = useToggle(wsId, artifact.id);
  const done = [...artifact.legal, ...artifact.technical].filter((item) => item.done).length;
  const total = artifact.legal.length + artifact.technical.length;
  return (
    <div className="flex flex-col gap-5">
      <p className="num text-sm text-muted">{t("ln.progress", { done, total })}</p>
      <section>
        <SectionTitle>{t("ln.legal")}</SectionTitle>
        <Panel>
          <Checklist items={artifact.legal} onToggle={toggle} />
        </Panel>
        <p className="mt-2 text-sm text-muted">{t("lg.notAdvice")}</p>
      </section>
      <section>
        <SectionTitle>{t("ln.technical")}</SectionTitle>
        <Panel>
          <Checklist items={artifact.technical} onToggle={toggle} />
        </Panel>
      </section>
    </div>
  );
}
