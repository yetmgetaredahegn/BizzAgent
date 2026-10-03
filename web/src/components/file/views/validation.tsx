"use client";

import type { ArtifactDetail } from "@/api";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useI18n } from "@/i18n";

import { SectionTitle } from "../parts";

type Validation = Extract<ArtifactDetail, { kind: "validation" }>;

export function ValidationView({ artifact }: { artifact: Validation }) {
  const { t } = useI18n();
  // The rubric is deterministic: risk is impact times uncertainty, highest first.
  const ranked = [...artifact.assumptions].sort((a, b) => b.impact * b.uncertainty - a.impact * a.uncertainty);
  return (
    <div className="flex flex-col gap-5">
      <section>
        <SectionTitle>{t("vd.assumptions")}</SectionTitle>
        <ul className="flex flex-col gap-2.5">
          {ranked.map((assumption) => {
            const risk = assumption.impact * assumption.uncertainty;
            return (
              <li key={assumption.id} className="rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-line">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 leading-snug font-semibold">{assumption.text}</p>
                  <span className="flex items-center gap-2">
                    <Tag highlight={risk >= 15}>{t("vd.risk", { n: risk })}</Tag>
                    <Tag>{t(assumption.confidence === "tested" ? "vd.tested" : "vd.assumed")}</Tag>
                  </span>
                </div>
                {assumption.experiment && (
                  <p className="text-sm text-muted">
                    <span className="num mr-1.5 text-xs tracking-wide uppercase">{t("vd.experiment")}</span>
                    {assumption.experiment}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-sm text-muted">{t("vd.riskNote")}</p>
      </section>
      <Panel title={t("vd.interviews")}>
        <ul className="ledger-rule">
          {artifact.interviews.map((interview) => (
            <li key={interview.id} className="py-3 first:pt-0 last:pb-0">
              <strong className="block">{interview.who}</strong>
              <span className="text-muted">{interview.learned}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
