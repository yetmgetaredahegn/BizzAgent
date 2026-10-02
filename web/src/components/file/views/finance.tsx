"use client";

import { useState } from "react";

import { api, type ArtifactDetail } from "@/api";
import { useQuery } from "@/api/use-query";
import { CalcTape } from "@/components/ds/calc-tape";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useI18n, useMsg } from "@/i18n";
import { formatCalcValue } from "@/lib/format-calc";

import { SectionTitle } from "../parts";

type Finance = Extract<ArtifactDetail, { kind: "finance" }>;

function Result({ label, calc }: { label: string; calc: Finance["results"][number]["calc"] }) {
  const { t } = useI18n();
  return (
    <details className="group rounded-sheet bg-surface ring-1 ring-line open:shadow-sheet">
      <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
        <span className="font-semibold">{label}</span>
        <span className="flex items-baseline gap-3">
          <span className="font-display num text-2xl font-bold">{formatCalcValue(calc.value, calc.unit)}</span>
          <span className="text-sm font-semibold text-stamp group-open:hidden">{t("fin.showSteps")}</span>
          <span className="hidden text-sm font-semibold text-stamp group-open:inline">{t("fin.hideSteps")}</span>
        </span>
      </summary>
      <div className="px-4 pb-4">
        <CalcTape result={calc} />
      </div>
    </details>
  );
}

/** What-if: a different price, recomputed by the same calculator and shown beside the original. */
function WhatIf({ base }: { base: NonNullable<Finance["whatIf"]> }) {
  const { t } = useI18n();
  const [price, setPrice] = useState(String(Math.round(base.price * 1.1)));
  const value = Number(price);
  const valid = Number.isFinite(value) && value > 0;
  const { data } = useQuery(`whatif:${base.cost}:${valid ? value : 0}`, () => (valid ? api.calc("margin", { price: value, cost: base.cost }) : Promise.resolve(null)));
  const original = useQuery(`whatif-base:${base.price}:${base.cost}`, () => api.calc("margin", { price: base.price, cost: base.cost }));
  return (
    <Panel title={t("fin.whatif")}>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("fin.whatif.price")}</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/[^\d.]/g, ""))}
            className="num h-11 w-36 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp"
          />
        </label>
        <p className="pb-2 text-sm text-muted">{t("fin.whatif.note")}</p>
      </div>
      <div className="grid items-start gap-4 tablet:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Tag className="w-fit">{t("fin.whatif.now")} · {formatCalcValue(base.price)}</Tag>
          {original.data && <CalcTape result={original.data} />}
        </div>
        <div className="flex flex-col gap-2">
          <Tag highlight className="w-fit">
            {t("fin.whatif.new")} · {formatCalcValue(valid ? value : 0)}
          </Tag>
          {data ? <CalcTape result={data} /> : <p className="text-sm text-muted">{t("fin.whatif.invalid")}</p>}
        </div>
      </div>
    </Panel>
  );
}

export function FinanceView({ artifact }: { wsId: string; artifact: Finance }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-5">
      <section>
        <SectionTitle>{t("fin.inputs")}</SectionTitle>
        <ul className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
          {artifact.inputs.map((input, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <span className="min-w-0">
                <span className="block font-semibold">{msg(input.label)}</span>
                <span className="text-sm text-muted">{msg(input.source)}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="num font-semibold">{formatCalcValue(input.value, input.unit)}</span>
                <EvidenceStamp status={input.status} compact />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>{t("fin.results")}</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {artifact.results.map((result) => (
            <Result key={result.id} label={msg(result.label)} calc={result.calc} />
          ))}
        </div>
      </section>

      {artifact.cashFlow && (
        <section>
          <SectionTitle>{t("fin.cashflow")}</SectionTitle>
          <div className="relative overflow-x-auto rounded-sheet bg-surface ring-1 ring-line">
            <table className="num w-full min-w-[28rem] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-normal">{t("fin.month")}</th>
                  <th className="px-2 py-2 text-right font-normal">{t("fin.in")}</th>
                  <th className="px-2 py-2 text-right font-normal">{t("fin.out")}</th>
                  <th className="px-4 py-2 text-right font-normal">{t("fin.balance")}</th>
                </tr>
              </thead>
              <tbody className="ledger-rule">
                {artifact.cashFlow.map((row) => (
                  <tr key={row.month} className="border-t border-line">
                    <td className="px-4 py-2 font-sans">{row.month}</td>
                    <td className="px-2 py-2 text-right">{formatCalcValue(row.inflow)}</td>
                    <td className="px-2 py-2 text-right">{formatCalcValue(row.outflow)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCalcValue(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {artifact.whatIf && <WhatIf base={artifact.whatIf} />}
    </div>
  );
}
