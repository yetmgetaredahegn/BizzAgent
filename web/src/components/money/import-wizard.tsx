"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { api, LEDGER_CATEGORIES, type ImportPreview, type ImportRow, type LedgerCategory } from "@/api";
import { DualDate } from "@/components/ds/format-parts";
import { Page, Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";

import { Amount } from "./money-screen";

type Step = { name: "choose" } | { name: "map"; text: string; headers: string[] } | { name: "preview"; rows: ImportRow[] } | { name: "done"; added: number; skipped: number };

export function ImportWizard() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const [step, setStep] = useState<Step>({ name: "choose" });
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState({ date: "", amount: "", description: "" });
  const [categories, setCategories] = useState<Record<string, LedgerCategory>>({});
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function show(preview: ImportPreview, text?: string) {
    setError(null);
    if (preview.ok) {
      setCategories(Object.fromEntries(preview.rows.map((r) => [r.id, r.category])));
      setConfirmed(new Set());
      setStep({ name: "preview", rows: preview.rows });
    } else if (preview.reason === "columns" && text) {
      setMapping({ date: preview.headers[0] ?? "", amount: preview.headers[1] ?? "", description: preview.headers[2] ?? "" });
      setStep({ name: "map", text, headers: preview.headers });
    } else {
      setError(t("imp.error.empty"));
    }
  }

  async function fromFile(file: File) {
    const text = await file.text();
    show(await api.previewImport(workspace.id, { kind: "csv", text }), text);
  }

  async function commit(rows: ImportRow[]) {
    setBusy(true);
    const result = await api.commitImport(
      workspace.id,
      rows.filter((r) => !r.duplicate).map((r) => ({ id: r.id, category: categories[r.id] })),
    );
    setBusy(false);
    setStep({ name: "done", ...result });
  }

  const select = "h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong";

  return (
    <Page eyebrow={workspace.name} title={t("imp.title")}>
      <p className="max-w-2xl text-muted">{t("imp.sub")}</p>

      {step.name === "choose" && (
        <Panel title={t("imp.step.choose")}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={async () => show(await api.previewImport(workspace.id, { kind: "sample" }))}>{t("imp.sample")}</Button>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("imp.csv")}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void fromFile(file);
                }}
                className="rounded-stamp p-2 ring-1 ring-line-strong file:mr-3 file:rounded-full file:border-0 file:bg-stamp file:px-4 file:py-2 file:font-semibold file:text-on-stamp"
              />
            </label>
            <p className="text-sm text-muted">{t("imp.formats")}</p>
            {error && (
              <p role="alert" className="text-sm font-semibold text-contradictory">
                {error}
              </p>
            )}
          </div>
        </Panel>
      )}

      {step.name === "map" && (
        <Panel title={t("imp.step.map")}>
          <p className="mb-3 text-sm text-muted">{t("imp.map.note")}</p>
          <div className="grid gap-3 tablet:grid-cols-3">
            {(["date", "amount", "description"] as const).map((key) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                <span className="text-muted">{t(`imp.map.${key}` as MessageId)}</span>
                <select value={mapping[key]} onChange={(event) => setMapping((m) => ({ ...m, [key]: event.target.value }))} className={select}>
                  {step.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={async () => show(await api.previewImport(workspace.id, { kind: "csv", text: step.text, columns: mapping }), step.text)}>{t("action.continue")}</Button>
            <Button variant="secondary" onClick={() => setStep({ name: "choose" })}>
              {t("action.back")}
            </Button>
          </div>
        </Panel>
      )}

      {step.name === "preview" && (
        <Panel title={t("imp.step.preview")}>
          {(() => {
            const fresh = step.rows.filter((r) => !r.duplicate);
            const ready = fresh.every((r) => confirmed.has(r.id));
            return (
              <>
                <p className="mb-3 text-sm text-muted">{t("imp.preview.note")}</p>
                <div className="relative overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-sm">
                    <thead className="text-left text-xs text-muted">
                      <tr>
                        <th className="py-1 font-normal">{t("mn.col.date")}</th>
                        <th className="py-1 font-normal">{t("mn.col.what")}</th>
                        <th className="py-1 text-right font-normal">{t("mn.col.amount")}</th>
                        <th className="py-1 pl-3 font-normal">{t("mn.col.category")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.rows.map((row) => (
                        <tr key={row.id} className="border-t border-line align-middle">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <DualDate iso={row.date} className="text-xs" />
                          </td>
                          <td className="py-2 pr-3">{row.description}</td>
                          <td className="py-2 text-right">
                            <Amount value={row.amount} />
                          </td>
                          <td className="py-2 pl-3">
                            {row.duplicate ? (
                              <Tag highlight>{t("imp.duplicate")}</Tag>
                            ) : (
                              <span className="flex items-center gap-2">
                                <label className="sr-only" htmlFor={`cat-${row.id}`}>
                                  {t("mn.col.category")}
                                </label>
                                <select
                                  id={`cat-${row.id}`}
                                  value={categories[row.id]}
                                  onChange={(event) => {
                                    setCategories((c) => ({ ...c, [row.id]: event.target.value as LedgerCategory }));
                                    setConfirmed((c) => new Set(c).add(row.id));
                                  }}
                                  className={select}
                                >
                                  {LEDGER_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                      {t(`mn.cat.${category}` as MessageId)}
                                    </option>
                                  ))}
                                </select>
                                {confirmed.has(row.id) ? (
                                  <Check className="size-4 text-established" aria-label={t("imp.confirmed")} />
                                ) : (
                                  <Tag>{t("imp.suggested")}</Tag>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setConfirmed(new Set(fresh.map((r) => r.id)))} disabled={ready}>
                    {t("imp.confirmAll")}
                  </Button>
                  <Button onClick={() => void commit(step.rows)} disabled={!ready || fresh.length === 0 || busy}>
                    {t("imp.commit", { n: fresh.length })}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep({ name: "choose" })}>
                    {t("action.cancel")}
                  </Button>
                </div>
                {!ready && <p className="mt-2 text-sm text-muted">{t("imp.mustConfirm")}</p>}
              </>
            );
          })()}
        </Panel>
      )}

      {step.name === "done" && (
        <Panel>
          <p className="font-display text-xl font-semibold">{t("imp.done", { added: step.added, skipped: step.skipped })}</p>
          <p className="mt-1 text-sm text-muted">{t("imp.done.note")}</p>
          <ButtonLink href={`/w/${workspace.id}/money`} className="mt-3 w-fit">
            {t("mn.title")}
          </ButtonLink>
        </Panel>
      )}
    </Page>
  );
}
