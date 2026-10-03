"use client";

import type { ArtifactDetail } from "@/api";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useI18n, useMsg } from "@/i18n";
import { formatCalcValue } from "@/lib/format-calc";

type Growth = Extract<ArtifactDetail, { kind: "growth" }>;

export function GrowthView({ artifact }: { artifact: Growth }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("gr.targetNote")}</p>
      {artifact.objectives.map((objective) => (
        <Panel key={objective.id} title={t("gr.objectives")}>
          <h2 className="font-display text-xl font-semibold">{msg(objective.title)}</h2>
          <ul className="ledger-rule mt-3">
            {objective.kpis.map((kpi, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                <span>{msg(kpi.label)}</span>
                <span className="flex items-center gap-2">
                  <span className="num font-semibold">{formatCalcValue(kpi.value, kpi.unit)}</span>
                  <Tag highlight={kpi.basis === "target"}>{t(kpi.basis === "target" ? "gr.basis.target" : "gr.basis.ledger")}</Tag>
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
            {objective.initiatives.map((initiative, i) => (
              <li key={i}>{msg(initiative)}</li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
