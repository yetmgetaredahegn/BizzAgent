"use client";

import type { ArtifactDetail } from "@/api";
import { CalcTape } from "@/components/ds/calc-tape";
import { Panel } from "@/components/ds/page";
import { formatCalcValue } from "@/lib/format-calc";
import { useI18n, useMsg } from "@/i18n";

import { CitationOrNone, SectionTitle } from "../parts";

type Market = Extract<ArtifactDetail, { kind: "market" }>;

export function MarketView({ artifact }: { artifact: Market }) {
  const { t } = useI18n();
  const msg = useMsg();
  const groups = (["global", "local"] as const).map((reach) => ({ reach, items: artifact.competitors.filter((c) => c.reach === reach) }));
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>{t("mk.sizing")}</SectionTitle>
        <div className="grid items-start gap-4 tablet:grid-cols-2">
          <Panel>
            <p className="font-display num text-3xl font-bold">{formatCalcValue(artifact.sizing.value, artifact.sizing.unit)}</p>
            <ul className="ledger-rule mt-3 text-sm">
              {artifact.sizingInputs.map((input, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                  <span>{msg(input.label)}</span>
                  <span className="num font-semibold">{formatCalcValue(input.value, input.unit)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">{t("mk.sizing.note")}</p>
          </Panel>
          <CalcTape result={artifact.sizing} />
        </div>
      </section>

      <section>
        <SectionTitle>{t("mk.competitors")}</SectionTitle>
        <div className="grid items-start gap-4 laptop:grid-cols-2">
          {groups.map(({ reach, items }) => (
            <div key={reach} className="flex flex-col gap-2.5">
              <h3 className="font-display text-lg font-semibold">{t(reach === "global" ? "mk.global" : "mk.local")}</h3>
              {items.map((competitor) => (
                <div key={competitor.name} className="rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-line">
                  <strong>{competitor.name}</strong>
                  <p className="text-sm text-muted">{competitor.note}</p>
                  <CitationOrNone citation={competitor.citation} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>{t("mk.gaps")}</SectionTitle>
        <div className="relative overflow-x-auto rounded-sheet bg-surface ring-1 ring-line">
          <table className="w-full min-w-[22rem] text-left">
            <tbody>
              {artifact.gaps.map((gap, i) => (
                <tr key={i} className="border-t border-line first:border-t-0">
                  <th scope="row" className="num w-40 px-4 py-3 align-top text-xs font-normal tracking-wide text-muted uppercase">
                    {msg(gap.dimension)}
                  </th>
                  <td className="px-4 py-3">{gap.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
