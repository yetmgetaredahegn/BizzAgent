"use client";

import { Lock, Upload } from "lucide-react";
import Link from "next/link";

import { api, type LedgerEntry } from "@/api";
import { useQuery } from "@/api/use-query";
import { CalcResultRow } from "@/components/ds/calc-tape";
import { DualDate } from "@/components/ds/format-parts";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Page, Panel } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";
import { formatCalcValue } from "@/lib/format-calc";

const nf = new Intl.NumberFormat("en-US");

export function Amount({ value }: { value: number }) {
  return (
    <span className={cn("num whitespace-nowrap", value < 0 ? "text-ink" : "text-established")}>
      {value < 0 ? "−" : "+"}
      {nf.format(Math.abs(value))}
    </span>
  );
}

function SourceStamp({ entry }: { entry: LedgerEntry }) {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-1.5">
      <EvidenceStamp status={entry.source === "voice" ? "unverified" : "established"} compact />
      <span className="sr-only sm:not-sr-only text-xs text-muted">{t(`mn.src.${entry.source}` as MessageId)}</span>
    </span>
  );
}

export function MoneyScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`money:${workspace.id}`, () => api.getMoney(workspace.id));
  const empty = data && data.entries.length === 0;

  return (
    <Page
      eyebrow={workspace.name}
      title={t("mn.title")}
      wide
      actions={
        <>
          <ButtonLink href="/me/money" variant="secondary" size="sm">
            <Lock className="size-4" aria-hidden /> {t("mn.personal")}
          </ButtonLink>
          <ButtonLink href={`/w/${workspace.id}/money/import`} size="sm">
            <Upload className="size-4" aria-hidden /> {t("mn.import")}
          </ButtonLink>
        </>
      }
    >
      {empty ? (
        <EmptyState
          art="receipt"
          title={t("mn.empty.title")}
          body={t("mn.empty.body")}
          action={
            <span className="flex flex-wrap justify-center gap-2">
              <ButtonLink href={`/w/${workspace.id}/money/import`}>{t("mn.import")}</ButtonLink>
              <ButtonLink href={`/w/${workspace.id}/talk`} variant="secondary">
                {t("home.talk")}
              </ButtonLink>
            </span>
          }
        />
      ) : (
        data && (
          <>
            <section aria-label={t("mn.kpis")} className="grid items-start gap-2.5 laptop:grid-cols-2">
              {data.kpis.map((kpi) => (
                <CalcResultRow key={kpi.id} label={msg(kpi.label)} calc={kpi.calc} />
              ))}
            </section>

            <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
              <Panel title={t("mn.months")}>
                <table className="num w-full text-sm">
                  <thead className="text-left text-xs text-muted">
                    <tr>
                      <th className="py-1 font-normal">{t("fin.month")}</th>
                      <th className="py-1 text-right font-normal">{t("fin.in")}</th>
                      <th className="py-1 text-right font-normal">{t("fin.out")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.months.map((month) => (
                      <tr key={month.month} className="border-t border-line">
                        <td className="py-2 font-sans">{month.month}</td>
                        <td className="py-2 text-right">{formatCalcValue(month.inflow)}</td>
                        <td className="py-2 text-right">{formatCalcValue(month.outflow)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title={t("mn.ledger")}>
                <div className="relative overflow-x-auto">
                  <table className="w-full min-w-[30rem] text-sm">
                    <thead className="text-left text-xs text-muted">
                      <tr>
                        <th className="py-1 font-normal">{t("mn.col.date")}</th>
                        <th className="py-1 font-normal">{t("mn.col.what")}</th>
                        <th className="py-1 font-normal">{t("mn.col.category")}</th>
                        <th className="py-1 text-right font-normal">{t("mn.col.amount")}</th>
                        <th className="py-1 pl-3 font-normal">{t("mn.col.source")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.slice(0, 14).map((entry) => (
                        <tr key={entry.id} className="border-t border-line align-top">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <DualDate iso={entry.date} className="text-xs" />
                          </td>
                          <td className="py-2 pr-3">{entry.description}</td>
                          <td className="py-2 pr-3 text-muted">{t(`mn.cat.${entry.category}` as MessageId)}</td>
                          <td className="py-2 text-right">
                            <Amount value={entry.amount} />
                          </td>
                          <td className="py-2 pl-3">
                            <SourceStamp entry={entry} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.entries.length > 14 && <p className="mt-2 text-sm text-muted">{t("mn.more", { n: data.entries.length - 14 })}</p>}
                <p className="mt-2 text-sm text-muted">
                  {t("mn.note")}{" "}
                  <Link href={`/w/${workspace.id}/money/import`} className="font-semibold text-stamp hover:underline">
                    {t("mn.import")}
                  </Link>
                </p>
              </Panel>
            </div>
          </>
        )
      )}
    </Page>
  );
}
