"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { api } from "@/api";
import { useQuery } from "@/api/use-query";
import { Page, Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { useI18n, useMsg, type MessageId } from "@/i18n";

import { FundTabs } from "./fund-tabs";

export function ReadinessScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`readiness:${workspace.id}`, () => api.getReadiness(workspace.id));
  return (
    <Page eyebrow={workspace.name} title={t("rd.title")}>
      <FundTabs />
      <p className="max-w-2xl text-muted">{t("rd.sub")}</p>
      {data && (
        <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_22rem]">
          <Panel title={t("rd.components")}>
            <p className="font-display num mb-4 text-5xl font-bold">
              {data.score}
              <span className="ml-2 text-lg font-normal text-muted">/ 100</span>
            </p>
            <ul className="ledger-rule">
              {data.components.map((component) => (
                <li key={component.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <strong>{t(`rd.c.${component.id}` as MessageId)}</strong>
                    <span className="num text-sm">
                      {component.points} / {component.max}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={t(`rd.c.${component.id}` as MessageId)}
                    aria-valuemin={0}
                    aria-valuemax={component.max}
                    aria-valuenow={component.points}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"
                  >
                    <div className="h-full bg-stamp" style={{ width: `${(component.points / component.max) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{msg(component.note)}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel title={t("rd.top")}>
              {data.actions.length === 0 ? (
                <p className="text-muted">{t("rd.none")}</p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {data.actions.map((action, i) => (
                    <li key={action.id}>
                      <Link href={action.href} className="group rounded-stamp flex items-center gap-3 p-3 ring-1 ring-line-strong hover:bg-ink/5">
                        <span className="num grid size-6 shrink-0 place-items-center rounded-full text-xs ring-1 ring-line-strong">{i + 1}</span>
                        <span className="min-w-0 flex-1 leading-snug font-semibold">{msg(action.title)}</span>
                        <Tag highlight>{t("rd.raises", { n: action.raises })}</Tag>
                        <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
            <p className="text-sm text-muted">{t("rd.explain")}</p>
          </div>
        </div>
      )}
    </Page>
  );
}
