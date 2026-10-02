"use client";

import { Download, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { api, type ActivityEvent } from "@/api";
import { useQuery } from "@/api/use-query";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { formatDateTime } from "@/lib/format";

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function ActivityScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`activity:${workspace.id}`, () => api.listActivity(workspace.id));
  const [agent, setAgent] = useState("all");

  const events = data ?? [];
  const agents = [...new Set(events.map((event) => event.agent))];
  const shown = events.filter((event) => agent === "all" || event.agent === agent);
  const agentLabel = (id: string) => t(`agent.${id}` as MessageId);

  function exportCsv() {
    const header = [t("activity.col.when"), t("activity.col.agent"), t("activity.col.what"), t("activity.col.sources"), t("activity.credits", { n: "" }).trim()];
    const rows = shown.map((event) => [event.at, agentLabel(event.agent), msg(event.action), event.sources.join("; "), event.credits]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-${workspace.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page
      title={t("activity.title")}
      actions={
        <Button variant="secondary" onClick={exportCsv} disabled={shown.length === 0}>
          <Download className="size-4" aria-hidden /> {t("activity.export")}
        </Button>
      }
    >
      <p className="max-w-2xl text-muted">{t("activity.sub")}</p>

      {data && events.length === 0 ? (
        <EmptyState art="receipt" title={t("activity.empty.title")} body={t("activity.empty.body")} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="agent-filter" className="sr-only">
              {t("activity.col.agent")}
            </label>
            <select
              id="agent-filter"
              value={agent}
              onChange={(event) => setAgent(event.target.value)}
              className="h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong"
            >
              <option value="all">{t("activity.filter.all")}</option>
              {agents.map((id) => (
                <option key={id} value={id}>
                  {agentLabel(id)}
                </option>
              ))}
            </select>
          </div>

          <ol className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
            {shown.map((event) => (
              <ActivityRow key={event.id} event={event} agentLabel={agentLabel(event.agent)} />
            ))}
          </ol>
        </>
      )}
    </Page>
  );
}

function ActivityRow({ event, agentLabel }: { event: ActivityEvent; agentLabel: string }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <li className="grid gap-x-4 gap-y-1 py-3 tablet:grid-cols-[9rem_8rem_minmax(0,1fr)_auto]">
      <time dateTime={event.at} className="num text-xs text-muted tablet:pt-1">
        {formatDateTime(event.at)}
      </time>
      <span className="num text-xs tracking-wide text-muted uppercase tablet:pt-1">{agentLabel}</span>
      <div className="min-w-0">
        <p className="leading-snug font-semibold">{msg(event.action)}</p>
        {event.sources.length > 0 && (
          <p className="mt-0.5 text-sm text-muted">
            <span className="sr-only">{t("activity.col.sources")}: </span>
            {event.sources.join(" · ")}
          </p>
        )}
        {event.approval && (
          <p className="num mt-1 inline-flex items-center gap-1 text-xs text-established">
            <ShieldCheck className="size-3.5" aria-hidden />
            {t("activity.approvedBy", {
              by: event.approval.by === "you" ? t("agent.you") : event.approval.by,
              via: t(event.approval.via === "voice" ? "activity.via.voice" : "activity.via.tap"),
            })}
          </p>
        )}
      </div>
      <span className="num text-sm text-muted tablet:text-right tablet:pt-0.5">
        {event.credits > 0 ? t("activity.credits", { n: event.credits }) : t("activity.free")}
      </span>
    </li>
  );
}
