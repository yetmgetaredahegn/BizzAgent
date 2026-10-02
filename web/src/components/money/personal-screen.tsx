"use client";

import { Lock } from "lucide-react";

import { api } from "@/api";
import { useQuery } from "@/api/use-query";
import { CalcResultRow, CalcTape } from "@/components/ds/calc-tape";
import { Page, Panel } from "@/components/ds/page";
import { BirrAmount } from "@/components/ds/format-parts";
import { useI18n, useMsg } from "@/i18n";
import { formatCalcValue } from "@/lib/format-calc";

export function PersonalMoneyScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { data } = useQuery("personal-money", () => api.getPersonalMoney());
  return (
    <Page title={t("pm.title")}>
      <div role="note" className="rounded-stamp flex items-center gap-2 bg-copy-yellow px-4 py-3 font-semibold text-ink">
        <Lock className="size-4 shrink-0" aria-hidden /> {t("pm.private")}
      </div>
      <p className="max-w-2xl text-muted">{t("pm.sub")}</p>
      {data && (
        <div className="grid items-start gap-5 laptop:grid-cols-2">
          <Panel title={t("pm.budget")}>
            <ul className="ledger-rule text-sm">
              <li className="flex justify-between gap-3 py-2 font-semibold">
                <span>{t("pm.income")}</span>
                <BirrAmount amount={data.budget.income} />
              </li>
              {data.budget.lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-3 py-2">
                  <span>{line.label}</span>
                  <BirrAmount amount={line.amount} />
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <CalcResultRow label={t("pm.left")} calc={data.budget.left} />
            </div>
          </Panel>

          <Panel title={t("pm.goals")}>
            <ul className="flex flex-col gap-4">
              {data.goals.map((goal) => (
                <li key={goal.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <strong>{goal.title}</strong>
                    <span className="num text-sm text-muted">
                      {formatCalcValue(goal.saved)} / {formatCalcValue(goal.target)}
                    </span>
                  </div>
                  <div role="progressbar" aria-label={goal.title} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={goal.saved} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full bg-stamp" style={{ width: `${Math.min(100, (goal.saved / goal.target) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{t("pm.goalMonths", { n: goal.months.value, monthly: formatCalcValue(goal.monthly) })}</p>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-sm font-semibold text-stamp">{t("fin.showSteps")}</summary>
                    <div className="mt-2">
                      <CalcTape result={goal.months} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={t("pm.netWorth")}>
            <div className="grid gap-3 tablet:grid-cols-2">
              {([["pm.assets", data.netWorth.assets], ["pm.liabilities", data.netWorth.liabilities]] as const).map(([title, lines]) => (
                <div key={title}>
                  <h3 className="num mb-1 text-xs tracking-wide text-muted uppercase">{t(title)}</h3>
                  <ul className="ledger-rule text-sm">
                    {lines.map((line) => (
                      <li key={line.label} className="flex justify-between gap-3 py-1.5">
                        <span>{line.label}</span>
                        <BirrAmount amount={line.amount} />
                      </li>
                    ))}
                    {lines.length === 0 && <li className="py-1.5 text-muted">–</li>}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <CalcResultRow label={t("pm.netWorth")} calc={data.netWorth.calc} />
            </div>
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel title={t("pm.ownersPay")}>
              <dl className="ledger-rule text-sm">
                <div className="flex justify-between gap-3 py-2">
                  <dt>{t("pm.pay")}</dt>
                  <dd>
                    <BirrAmount amount={data.ownersPay.pay} />
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt>{t("pm.profit")}</dt>
                  <dd>{data.ownersPay.businessProfit === null ? t("pm.noLedger") : <BirrAmount amount={data.ownersPay.businessProfit} />}</dd>
                </div>
              </dl>
              {data.ownersPay.businessProfit !== null && data.ownersPay.pay > data.ownersPay.businessProfit && (
                <p role="note" className="mt-2 text-sm font-semibold text-contradictory">
                  {t("pm.payOver")}
                </p>
              )}
            </Panel>

            <Panel title={t("pm.separate")}>
              <ul className="ledger-rule">
                {data.separate.map((item) => (
                  <li key={item.id}>
                    <label className="flex min-h-11 items-start gap-3 py-2.5">
                      <input type="checkbox" checked={item.done} onChange={(event) => void api.togglePersonalCheck(item.id, event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-stamp" />
                      <span>{msg(item.text)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </Page>
  );
}
