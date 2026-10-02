"use client";

import { Fragment } from "react";

import type { Sheet, SheetAdvisor, SheetEntry, SheetIdea, SheetMargin } from "@/api";
import { CarbonSheet } from "@/components/ds/carbon";
import { CitationSlip } from "@/components/ds/citation-slip";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { CalcTape } from "@/components/ds/calc-tape";
import { EmptyState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { formatCalcValue } from "@/lib/format-calc";

function MarginSheet({ sheet }: { sheet: SheetMargin }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-bold">{t("sheet.margin.title")}</h2>
        <span className="flex items-center gap-2">
          <span className="font-display num text-3xl font-bold">{formatCalcValue(sheet.base.value, "percent")}</span>
          <EvidenceStamp status="unverified" source={t("sheet.margin.said")} compact />
        </span>
      </div>
      <div className={sheet.whatIf ? "grid gap-4 tablet:grid-cols-2" : ""}>
        <CalcTape result={sheet.base} inputSource={t("sheet.margin.said")} />
        {sheet.whatIf && (
          <div className="flex flex-col gap-2">
            <Tag highlight className="w-fit">
              {t("sheet.margin.whatif")} · {formatCalcValue(sheet.whatIf.price)}
            </Tag>
            <CalcTape result={sheet.whatIf.result} inputSource={t("sheet.margin.said")} />
          </div>
        )}
      </div>
    </div>
  );
}

function IdeaSheetView({ sheet }: { sheet: SheetIdea }) {
  const { t } = useI18n();
  return (
    <CarbonSheet role={sheet.approved ? "original" : "draft"} edgeLabel={sheet.approved ? undefined : t("sheet.idea.draft").split(":")[0].toUpperCase()} active>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-bold">{t("sheet.idea.title")}</h2>
        <span className="num text-xs text-muted">
          {t("sheet.idea.version", { n: sheet.version })} · {sheet.approved ? t("sheet.idea.approved") : t("sheet.idea.draft")}
        </span>
      </div>
      <dl className="ledger-rule mt-3">
        {sheet.fields.map((field) => (
          <div key={field.key} className="grid gap-1 py-3 tablet:grid-cols-[10rem_minmax(0,1fr)_auto] tablet:items-center tablet:gap-4">
            <dt className="num text-xs tracking-wide text-muted uppercase">{t(`idea.${field.key}` as MessageId)}</dt>
            <dd className={field.value ? "" : "text-muted italic"}>{field.value ?? t("idea.notSaid")}</dd>
            <EvidenceStamp status={field.status} source={field.value ? t("sheet.margin.said") : undefined} />
          </div>
        ))}
      </dl>
    </CarbonSheet>
  );
}

function EntrySheetView({ sheet }: { sheet: SheetEntry }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-bold">{t("sheet.entry.title", { market: sheet.market })}</h2>
        <Tag>{t("tag.demo")}</Tag>
      </div>
      <dl className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
        {sheet.rows.map((row) => (
          <div key={row.key} className="grid gap-1 py-3 tablet:grid-cols-[11rem_minmax(0,1fr)_auto] tablet:items-center tablet:gap-4">
            <dt className="num text-xs tracking-wide text-muted uppercase">{t(row.key as MessageId)}</dt>
            <dd>{msg(row.value)}</dd>
            <EvidenceStamp status={row.status} />
          </div>
        ))}
      </dl>
      <div>
        <h3 className="num mb-2 text-xs tracking-wide text-muted uppercase">{t("entry.comp")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left text-sm">
            <tbody className="ledger-rule">
              {sheet.competitors.map((c) => (
                <Fragment key={c.name}>
                  <tr>
                    <th scope="row" className="py-2 pr-3 font-semibold">
                      {c.name}
                    </th>
                    <td className="py-2 pr-3">
                      <Tag>{c.reach === "global" ? t("entry.comp.global") : t("entry.comp.local")}</Tag>
                    </td>
                    <td className="num py-2 text-xs text-muted">{c.source}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdvisorSheetView({ sheet }: { sheet: SheetAdvisor }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-bold">{t("sheet.advisor.title")}</h2>
      <CitationSlip title={t("sheet.advisor.noAnswer")} origin="knowledge · et.legal_forms.*" unverified>
        <p className="mt-1 text-xs text-muted">{t("notice.notAdvice")}</p>
      </CitationSlip>
      <ol className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
        {sheet.questions.map((q, i) => (
          <li key={i} className="flex gap-3 py-3">
            <span className="num text-stamp">{i + 1}</span>
            <span>{msg(q)}</span>
          </li>
        ))}
      </ol>
      {sheet.owners && (
        <div>
          <h3 className="num mb-1 text-xs tracking-wide text-muted uppercase">{t("sheet.advisor.facts")}</h3>
          <p className="flex items-center gap-2">
            {t("sheet.advisor.owners", { text: sheet.owners })}
            <EvidenceStamp status="unverified" compact />
          </p>
        </div>
      )}
    </div>
  );
}

export function SheetView({ sheet }: { sheet: Sheet | null }) {
  const { t } = useI18n();
  if (!sheet) {
    return <EmptyState art="receipt" title={t("talk.sheet.empty.title")} body={t("talk.sheet.empty.body")} />;
  }
  switch (sheet.kind) {
    case "margin":
      return <MarginSheet sheet={sheet} />;
    case "idea":
      return <IdeaSheetView sheet={sheet} />;
    case "entry":
      return <EntrySheetView sheet={sheet} />;
    case "advisor":
      return <AdvisorSheetView sheet={sheet} />;
  }
}
