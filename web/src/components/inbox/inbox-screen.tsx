"use client";

import { Check, Mic } from "lucide-react";
import { useState } from "react";

import { api, type InboxItem } from "@/api";
import { useQuery } from "@/api/use-query";
import { Composer } from "@/components/ds/composer";
import { CostTicket } from "@/components/ds/cost-ticket";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg } from "@/i18n";
import { cn } from "@/lib/format";

type Filter = "all" | "approval" | "question";
const AFFIRMATIVE = /^\s*(yes|yeah|ok|okay|approve|አዎ|እሺ|eeyyee|eyyee|ni'aa)/i;

function ApprovalCard({ item, wsId, selected, onSelect }: { item: InboxItem; wsId: string; selected: boolean; onSelect: (on: boolean) => void }) {
  const { t } = useI18n();
  const msg = useMsg();
  const [voice, setVoice] = useState(false);
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approve" | "decline", via: "tap" | "voice") {
    setBusy(true);
    await api.decide(wsId, item.id, decision, via);
    setBusy(false);
  }

  return (
    <article className="rounded-sheet flex flex-col gap-3 bg-surface p-4 ring-1 ring-line" aria-labelledby={`t-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Tag highlight className="mb-1.5">
            {t("inbox.tab.approvals")}
          </Tag>
          <h2 id={`t-${item.id}`} className="font-display text-lg leading-snug font-semibold">
            {msg(item.title)}
          </h2>
          <p className="mt-1 text-sm text-muted">{msg(item.why)}</p>
        </div>
        <label className="min-touch flex shrink-0 items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} className="size-5 accent-stamp" />
          <span className="sr-only tablet:not-sr-only">{t("inbox.select")}</span>
        </label>
      </div>

      {item.evidence.length > 0 && (
        <div>
          <h3 className="num mb-1 text-xs tracking-wide text-muted uppercase">{t("inbox.evidence")}</h3>
          <ul className="ledger-rule text-sm">
            {item.evidence.map((e) => (
              <li key={e.label} className="flex items-center justify-between gap-3 py-1.5">
                <span>{e.label}</span>
                <EvidenceStamp status={e.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.cost && (
        <CostTicket
          className="max-w-md"
          estimate={{ ...item.cost, action: msg(item.cost.action) }}
        />
      )}

      <p className="text-sm text-muted">{item.undoMinutes ? t("inbox.undo", { n: item.undoMinutes }) : t("inbox.noUndo")}</p>

      {voice ? (
        <div className="flex flex-col gap-2 rounded-sheet bg-paper p-3">
          <p className="font-semibold">{t("inbox.voice.readback", { title: msg(item.title) })}</p>
          <p className="text-sm text-muted">{t("inbox.voice.hint")}</p>
          <Composer
            sample={t("action.yes")}
            onSend={(text, via) => {
              if (AFFIRMATIVE.test(text)) void decide("approve", via === "voice" ? "voice" : "tap");
              else setVoice(false);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => decide("approve", "tap")} disabled={busy}>
            <Check className="size-4" aria-hidden /> {t("inbox.approve")}
          </Button>
          <Button variant="secondary" onClick={() => decide("decline", "tap")} disabled={busy}>
            {t("inbox.decline")}
          </Button>
          <Button variant="ghost" onClick={() => setVoice(true)}>
            <Mic className="size-4" aria-hidden /> {t("inbox.voice")}
          </Button>
        </div>
      )}
    </article>
  );
}

function QuestionCard({ item, wsId }: { item: InboxItem; wsId: string }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <article className="rounded-sheet flex flex-col gap-3 bg-surface p-4 ring-1 ring-line" aria-labelledby={`t-${item.id}`}>
      <div>
        <Tag className="mb-1.5">{t("inbox.tab.questions")}</Tag>
        <h2 id={`t-${item.id}`} className="font-display text-lg leading-snug font-semibold">
          {msg(item.title)}
        </h2>
        <p className="mt-1 text-sm text-muted">{msg(item.why)}</p>
        {item.unblocks ? <p className="num mt-1 text-xs text-stamp">{t("inbox.unblocks", { n: item.unblocks })}</p> : null}
      </div>
      <Composer sample={item.sample} onSend={(text) => void api.answerQuestion(wsId, item.id, text)} placeholder={t("inbox.answer")} />
    </article>
  );
}

function DecidedRow({ item }: { item: InboxItem }) {
  const { t } = useI18n();
  const msg = useMsg();
  const label = item.type === "question" ? t("inbox.answered") : item.status === "approved" ? t("inbox.approved") : t("inbox.declined");
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
      <span className="min-w-0">
        <span className="font-semibold">{msg(item.title)}</span>
        {item.kind === "submit" && item.status === "approved" && <span className="block text-muted">{t("inbox.item.submitted")}</span>}
        {item.answer && <span className="block text-muted">“{item.answer}”</span>}
      </span>
      <span className="num flex items-center gap-2 text-xs text-muted">
        <Check className="size-4 text-established" aria-hidden /> {label}
        {item.decidedVia && ` · ${t(item.decidedVia === "voice" ? "activity.via.voice" : "activity.via.tap")}`}
      </span>
    </li>
  );
}

export function InboxScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`inbox:${workspace.id}`, () => api.listInbox(workspace.id));
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const pending = (data ?? []).filter((i) => i.status === "pending");
  const decided = (data ?? []).filter((i) => i.status !== "pending");
  const shown = pending.filter((i) => filter === "all" || i.type === filter);
  const selectedKinds = new Set(pending.filter((i) => selected.includes(i.id)).map((i) => i.kind));
  const canBatch = selected.length >= 2 && selectedKinds.size === 1;

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t("inbox.tab.all"), count: pending.length },
    { id: "approval", label: t("inbox.tab.approvals"), count: pending.filter((i) => i.type === "approval").length },
    { id: "question", label: t("inbox.tab.questions"), count: pending.filter((i) => i.type === "question").length },
  ];

  return (
    <Page title={t("inbox.title")}>
      <div role="tablist" aria-label={t("inbox.title")} className="flex w-fit gap-1 rounded-full p-0.5 ring-1 ring-line-strong">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn("min-touch rounded-full px-4 text-sm font-semibold", filter === tab.id ? "bg-stamp text-on-stamp" : "text-muted")}
          >
            {tab.label} <span className="num ml-1 text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      {canBatch && (
        <Button
          className="w-fit"
          onClick={async () => {
            await api.batchApprove(workspace.id, selected);
            setSelected([]);
          }}
        >
          {t("inbox.batch", { n: selected.length })}
        </Button>
      )}

      {data && shown.length === 0 ? (
        <EmptyState art="tray" title={t("inbox.empty.title")} body={t("inbox.empty.body")} />
      ) : (
        <div className="grid items-start gap-4 laptop:grid-cols-2">
          {shown.map((item) =>
            item.type === "approval" ? (
              <ApprovalCard
                key={item.id}
                item={item}
                wsId={workspace.id}
                selected={selected.includes(item.id)}
                onSelect={(on) => setSelected((s) => (on ? [...s, item.id] : s.filter((id) => id !== item.id)))}
              />
            ) : (
              <QuestionCard key={item.id} item={item} wsId={workspace.id} />
            ),
          )}
        </div>
      )}

      {decided.length > 0 && (
        <ul className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
          {decided.map((item) => (
            <DecidedRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Page>
  );
}
