"use client";

import QRCode from "qrcode";
import { useState } from "react";

import { api, type FieldRow, type PassportShare } from "@/api";
import { useQuery } from "@/api/use-query";
import { DualDate } from "@/components/ds/format-parts";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Page, Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";

import { FundTabs } from "./fund-tabs";

export function PassportFacts({ facts }: { facts: FieldRow[] }) {
  const msg = useMsg();
  return (
    <dl className="ledger-rule">
      {facts.map((fact, i) => (
        <div key={i} className="grid gap-1 py-3 tablet:grid-cols-[11rem_minmax(0,1fr)_auto] tablet:items-center tablet:gap-4">
          <dt className="num text-xs tracking-wide text-muted uppercase">{msg(fact.key)}</dt>
          <dd className="min-w-0 font-semibold">
            {msg(fact.value)}
            {fact.source && <span className="block text-sm font-normal text-muted">{msg(fact.source)}</span>}
          </dd>
          <dd>
            <EvidenceStamp status={fact.status} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ShareRow({ share, onRevoke }: { share: PassportShare; onRevoke: () => void }) {
  const { t } = useI18n();
  const msg = useMsg();
  const state = share.state;
  return (
    <li className="flex flex-col gap-1.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2">
          <Tag>{t(share.scope === "full" ? "pp.scope.full" : "pp.scope.basic")}</Tag>
          {state !== "ok" && <Tag highlight>{t(state === "revoked" ? "pp.revoked" : "pp.expired")}</Tag>}
        </span>
        {state === "ok" && (
          <Button size="sm" variant="danger" onClick={onRevoke}>
            {t("pp.revoke")}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted">
        {t("pp.expires")} <DualDate iso={share.expiresAt} /> · {t("pp.views", { n: share.views.length })}
      </p>
      <p className="num text-xs break-all text-muted">/passport/{share.token}</p>
      {share.views.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-stamp">{t("pp.log")}</summary>
          <ul className="mt-1 flex flex-col gap-0.5 text-muted">
            {share.views.map((view, i) => (
              <li key={i} className="num text-xs">
                {view.at.replace("T", " ")} · {msg(view.who)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

export function PassportScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`passport:${workspace.id}`, () => api.getPassport(workspace.id));
  const [scope, setScope] = useState<PassportShare["scope"]>("basic");
  const [days, setDays] = useState(30);
  const [created, setCreated] = useState<{ url: string; qr: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function create() {
    const share = await api.createShare(workspace.id, { scope, days });
    const url = `${window.location.origin}/passport/${share.token}`;
    const qr = await QRCode.toString(url, { type: "svg", margin: 1, width: 168 });
    setCreated({ url, qr });
    setCopied(false);
  }

  return (
    <Page eyebrow={workspace.name} title={t("pp.title")}>
      <FundTabs />
      <p className="max-w-2xl text-muted">{t("pp.sub")}</p>
      {data && (
        <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_24rem]">
          <Panel title={t("pp.facts")}>
            <PassportFacts facts={data.facts} />
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel title={t("pp.share")}>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">{t("pp.scope")}</span>
                  <select value={scope} onChange={(event) => setScope(event.target.value as PassportShare["scope"])} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
                    {(["basic", "full"] as const).map((value) => (
                      <option key={value} value={value}>
                        {t(`pp.scope.${value}` as MessageId)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">{t("pp.expiry")}</span>
                  <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
                    {[7, 30, 90].map((value) => (
                      <option key={value} value={value}>
                        {t("pp.days", { n: value })}
                      </option>
                    ))}
                  </select>
                </label>
                <Button onClick={create} className="w-fit">
                  {t("pp.create")}
                </Button>
                {created && (
                  <div className="rounded-stamp flex flex-col gap-2 bg-copy-yellow p-3 text-ink">
                    <p className="num text-xs tracking-wide uppercase">{t("pp.link")}</p>
                    <p className="num text-sm break-all">{created.url}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-fit"
                      onClick={async () => {
                        await navigator.clipboard?.writeText(created.url).catch(() => undefined);
                        setCopied(true);
                      }}
                    >
                      {copied ? t("pp.copied") : t("pp.copy")}
                    </Button>
                    <div role="img" aria-label={t("pp.qr")} className="w-fit bg-white p-1" dangerouslySetInnerHTML={{ __html: created.qr }} />
                  </div>
                )}
              </div>
            </Panel>

            <Panel title={t("pp.active")}>
              {data.shares.length === 0 ? (
                <p className="text-sm text-muted">{t("pp.none")}</p>
              ) : (
                <ul className="ledger-rule">
                  {data.shares.map((share) => (
                    <ShareRow key={share.id} share={share} onRevoke={() => void api.revokeShare(workspace.id, share.id)} />
                  ))}
                </ul>
              )}
            </Panel>
            <p className="text-sm text-muted">{t("pp.note")}</p>
          </div>
        </div>
      )}
    </Page>
  );
}
