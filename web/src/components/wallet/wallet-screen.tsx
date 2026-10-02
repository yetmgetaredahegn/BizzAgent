"use client";

import { Download, Plus } from "lucide-react";
import { useState } from "react";

import { api, type PaymentProvider } from "@/api";
import { useQuery } from "@/api/use-query";
import { DualDate } from "@/components/ds/format-parts";
import { Page, Panel } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { Tag } from "@/components/ds/tag";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

const PROVIDERS: PaymentProvider[] = ["chapa", "telebirr", "card"];
const TIERS = [50, 100, 250, 500];

function TopUpSheet({ open, onClose, birrPerCredit }: { open: boolean; onClose: () => void; birrPerCredit: number }) {
  const { t } = useI18n();
  const [provider, setProvider] = useState<PaymentProvider>("telebirr");
  const [credits, setCredits] = useState(100);
  const [done, setDone] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    const result = await api.topUp(provider, credits);
    setBusy(false);
    setDone(result.credits);
  }

  return (
    <Sheet open={open} onClose={() => { setDone(null); onClose(); }} title={t("wl.topup.title")}>
      {done !== null ? (
        <div className="flex flex-col gap-3">
          <p className="font-display text-xl font-semibold">{t("wl.paid", { n: done })}</p>
          <Button className="w-fit" onClick={() => { setDone(null); onClose(); }}>
            {t("action.close")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="num mb-2 text-xs tracking-wide text-muted uppercase">{t("wl.provider")}</legend>
            <div className="grid gap-2 phone:grid-cols-3">
              {PROVIDERS.map((id) => (
                <label key={id} className={cn("min-touch rounded-stamp flex cursor-pointer items-center justify-center px-3 py-2.5 text-center text-sm font-semibold ring-1", provider === id ? "bg-stamp text-on-stamp ring-stamp" : "ring-line-strong")}>
                  <input type="radio" name="provider" value={id} checked={provider === id} onChange={() => setProvider(id)} className="sr-only" />
                  {t(`wl.provider.${id}` as MessageId)}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="num mb-2 text-xs tracking-wide text-muted uppercase">{t("wl.amount")}</legend>
            <div className="grid grid-cols-2 gap-2 phone:grid-cols-4">
              {TIERS.map((tier) => (
                <label key={tier} className={cn("min-touch rounded-stamp flex cursor-pointer flex-col items-center justify-center px-2 py-2 text-center ring-1", credits === tier ? "bg-stamp text-on-stamp ring-stamp" : "ring-line-strong")}>
                  <input type="radio" name="amount" value={tier} checked={credits === tier} onChange={() => setCredits(tier)} className="sr-only" />
                  <span className="num font-semibold">{tier}</span>
                  <span className="num text-xs opacity-80">Br {tier * birrPerCredit}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-sm text-muted">{t("wl.provider.note")}</p>
          <Button onClick={pay} disabled={busy} className="w-fit">
            {t("wl.pay", { birr: credits * birrPerCredit })}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function downloadReceipt(topup: { id: string; at: string; provider: string; credits: number; birr: number }) {
  const text = ["BizzAgent receipt (prototype)", `Receipt: ${topup.id}`, `Date: ${topup.at}`, `Provider: ${topup.provider} (sandbox)`, `Credits: ${topup.credits}`, `Paid: Br ${topup.birr}`, "", "Fictional prototype data."].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${topup.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function WalletScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { data } = useQuery("wallet", () => api.getWallet());
  const { data: usage } = useQuery("usage", () => api.listUsage());
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState<string | null>(null);
  const [low, setLow] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState("all");
  const [saved, setSaved] = useState(false);

  const workspaces = [...new Map((usage ?? []).map((u) => [u.workspaceId, u.workspace])).entries()];
  const rows = (usage ?? []).filter((u) => workspace === "all" || u.workspaceId === workspace);
  const isLow = data ? data.balance <= data.lowAlert : false;

  return (
    <Page title={t("wl.title")} wide actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> {t("wl.topup")}</Button>}>
      {data && (
        <>
          <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <Panel title={t("wl.balance")}>
              <p className="font-display num text-5xl font-bold">
                {data.balance}
                <span className="ml-2 text-lg font-normal text-muted">{t("wl.credits")}</span>
              </p>
              {isLow && (
                <p role="alert" className="mt-2 inline-block rounded-stamp bg-meskel px-2 py-1 text-sm font-semibold text-on-meskel">
                  {t("wl.low")}
                </p>
              )}
              <p className="num mt-3 text-sm text-muted">{t("wl.capUsed", { used: data.capUsed, cap: data.cap })}</p>
              <div role="progressbar" aria-label={t("wl.cap")} aria-valuemin={0} aria-valuemax={data.cap} aria-valuenow={Math.min(data.capUsed, data.cap)} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-stamp" style={{ width: `${data.cap ? Math.min(100, (data.capUsed / data.cap) * 100) : 0}%` }} />
              </div>
            </Panel>

            <Panel title={t("wl.cap")}>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">{t("wl.cap.label")}</span>
                  <input inputMode="numeric" value={cap ?? String(data.cap)} onChange={(event) => { setCap(event.target.value.replace(/\D/g, "")); setSaved(false); }} className="num h-11 w-40 rounded-stamp bg-surface px-3 ring-1 ring-line-strong" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">{t("wl.low.label")}</span>
                  <input inputMode="numeric" value={low ?? String(data.lowAlert)} onChange={(event) => { setLow(event.target.value.replace(/\D/g, "")); setSaved(false); }} className="num h-11 w-40 rounded-stamp bg-surface px-3 ring-1 ring-line-strong" />
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await api.setWalletSettings({ cap: Number(cap ?? data.cap), lowAlert: Number(low ?? data.lowAlert) });
                      setSaved(true);
                    }}
                  >
                    {t("action.save")}
                  </Button>
                  {saved && <span className="num text-sm text-established">{t("ac.saved")}</span>}
                </div>
                <p className="text-sm text-muted">{t("wl.cap.note")}</p>
              </div>
            </Panel>
          </div>

          <Panel title={t("wl.usage")}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t("wl.col.workspace")}</span>
                <select value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
                  <option value="all">{t("wl.allWorkspaces")}</option>
                  {workspaces.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {rows.length === 0 ? (
              <p className="text-muted">{t("wl.usage.empty")}</p>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead className="text-left text-xs text-muted">
                    <tr>
                      <th className="py-1 font-normal">{t("mn.col.date")}</th>
                      <th className="py-1 font-normal">{t("wl.col.action")}</th>
                      <th className="py-1 font-normal">{t("wl.col.workspace")}</th>
                      <th className="py-1 text-right font-normal">{t("wl.col.credits")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-line align-top">
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <DualDate iso={row.at.slice(0, 10)} className="text-xs" />
                        </td>
                        <td className="py-2 pr-3">{msg(row.action)}</td>
                        <td className="py-2 pr-3 text-muted">{row.workspace}</td>
                        <td className="num py-2 text-right">{row.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid items-start gap-5 laptop:grid-cols-2">
            <Panel title={t("wl.price")} aside={<Tag>{t("wl.price.version", { v: data.price.version })}</Tag>}>
              <ul className="ledger-rule text-sm">
                {data.price.items.map((item, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                    <span>
                      {msg(item.action)} <span className="text-muted">· {msg(item.unit)}</span>
                    </span>
                    <span className="num font-semibold">{item.credits}</span>
                  </li>
                ))}
              </ul>
              <p className="num mt-2 text-xs text-muted">{t("wl.price.birr", { n: data.price.birrPerCredit })}</p>
              <p className="mt-2 text-sm text-muted">{t("wl.price.rules")}</p>
            </Panel>

            <Panel title={t("wl.receipts")}>
              {data.topups.length === 0 ? (
                <p className="text-muted">{t("wl.receipts.none")}</p>
              ) : (
                <ul className="ledger-rule">
                  {data.topups.map((topup) => (
                    <li key={topup.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span>
                        <strong className="num">+{topup.credits}</strong> <span className="text-muted">· Br {topup.birr} · {t(`wl.provider.${topup.provider}` as MessageId)}</span>
                        <span className="block text-xs text-muted">
                          <DualDate iso={topup.at.slice(0, 10)} />
                        </span>
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => downloadReceipt(topup)}>
                        <Download className="size-4" aria-hidden /> {t("wl.receipt.download")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
          <TopUpSheet open={open} onClose={() => setOpen(false)} birrPerCredit={data.price.birrPerCredit} />
        </>
      )}
    </Page>
  );
}
