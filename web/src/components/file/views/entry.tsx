"use client";

import type { ArtifactDetail } from "@/api";
import { CalcTape } from "@/components/ds/calc-tape";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Panel } from "@/components/ds/page";
import { formatCalcValue } from "@/lib/format-calc";
import { useI18n, useMsg, type MessageId } from "@/i18n";

import { CitationOrNone, SectionTitle } from "../parts";

type Entry = Extract<ArtifactDetail, { kind: "entry" }>;

export function EntryView({ artifact }: { artifact: Entry }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle aside={<span className="font-display num text-2xl font-bold">{formatCalcValue(artifact.attractiveness.value, "percent")}</span>}>
          {t("en.rubric")}
        </SectionTitle>
        <div className="grid items-start gap-4 laptop:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="overflow-x-auto rounded-sheet bg-surface ring-1 ring-line">
            <table className="num w-full min-w-[26rem] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-normal">{t("en.criterion")}</th>
                  <th className="px-2 py-2 text-right font-normal">{t("en.weight")}</th>
                  <th className="px-2 py-2 text-right font-normal">{t("en.score")}</th>
                  <th className="px-4 py-2 font-normal" />
                </tr>
              </thead>
              <tbody>
                {artifact.rubric.map((row, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2.5 font-sans">{msg(row.criterion)}</td>
                    <td className="px-2 py-2.5 text-right">{row.weight}</td>
                    <td className="px-2 py-2.5 text-right">{row.score}</td>
                    <td className="px-4 py-2.5 text-right">
                      <EvidenceStamp status={row.status} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CalcTape result={artifact.attractiveness} />
        </div>
      </section>

      <Panel title={t("en.mode")}>
        <p className="font-display text-xl font-semibold">{t(`en.mode.${artifact.entryMode.id}` as MessageId)}</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          {artifact.entryMode.reasons.map((reason, i) => (
            <li key={i}>{msg(reason)}</li>
          ))}
        </ul>
      </Panel>

      <section>
        <SectionTitle>{t("en.cost")}</SectionTitle>
        <div className="grid items-start gap-4 tablet:grid-cols-2">
          <CalcTape result={artifact.costToEnter} />
          <div className="flex flex-col gap-2">
            <p className="num text-sm text-muted">{t("en.breakEven")}</p>
            <CalcTape result={artifact.breakEven} />
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>{t("en.req")}</SectionTitle>
        <Panel>
          <ul className="ledger-rule">
            {artifact.requirements.map((req, i) => (
              <li key={i} className="grid gap-2 py-3 tablet:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] tablet:gap-5">
                <strong>{msg(req.text)}</strong>
                {req.citation ? <CitationOrNone citation={req.citation} /> : <p className="rounded-stamp bg-meskel/25 px-2 py-1 text-sm">{t("en.noSource")}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}
