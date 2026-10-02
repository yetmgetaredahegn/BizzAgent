"use client";

import { useState } from "react";

import { api } from "@/api";
import { useQuery } from "@/api/use-query";
import { StampRing } from "@/components/ds/evidence-stamp";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg } from "@/i18n";

import { FundTabs } from "./fund-tabs";

export function CommonApplicationScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`common:${workspace.id}`, () => api.getCommonApplication(workspace.id));
  const [off, setOff] = useState<string[]>([]);

  const calls = (data?.calls ?? []).filter((c) => !off.includes(c.id));
  const needed = (data?.fields ?? []).filter((f) => f.requiredBy.some((id) => calls.some((c) => c.id === id)));
  const gaps = needed.filter((f) => f.status === "missing").length;
  const filled = needed.length - gaps;

  return (
    <Page eyebrow={workspace.name} title={t("ca.title")} wide>
      <FundTabs />
      <p className="max-w-2xl text-muted">{t("ca.sub")}</p>
      {data && data.calls.length === 0 ? (
        <EmptyState
          art="checklist"
          title={t("ca.empty.title")}
          body={t("ca.empty.body")}
          action={<ButtonLink href={`/w/${workspace.id}/opportunities`}>{t("fund.tab.opps")}</ButtonLink>}
        />
      ) : (
        data && (
          <>
            <p role="status" className="font-display text-xl font-semibold">
              {t("ca.summary", { answers: filled, calls: calls.length, gaps })}
            </p>
            <div className="relative overflow-x-auto rounded-sheet bg-surface ring-1 ring-line">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="align-bottom">
                    <th scope="col" className="num px-4 py-3 text-xs font-normal tracking-wide text-muted uppercase">
                      {t("ca.answer")}
                    </th>
                    {data.calls.map((call) => (
                      <th key={call.id} scope="col" className="min-w-36 px-3 py-3 font-normal">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={!off.includes(call.id)}
                            onChange={(event) => setOff((o) => (event.target.checked ? o.filter((id) => id !== call.id) : [...o, call.id]))}
                            className="mt-0.5 size-5 shrink-0 accent-stamp"
                          />
                          <span className="leading-snug font-semibold">{call.title}</span>
                        </label>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.fields.map((field) => (
                    <tr key={field.id} className="border-t border-line">
                      <th scope="row" className="px-4 py-3 text-left align-top font-normal">
                        <span className="flex items-start gap-2.5">
                          <StampRing status={field.status} className="mt-0.5" />
                          <span>
                            <strong className="block">{msg(field.label)}</strong>
                            <span className="text-xs text-muted">{msg(field.source)}</span>
                          </span>
                        </span>
                      </th>
                      {data.calls.map((call) => {
                        const required = field.requiredBy.includes(call.id);
                        return (
                          <td key={call.id} className="px-3 py-3 align-top">
                            {required ? (
                              <span className="inline-flex items-center gap-1.5 text-muted">
                                <StampRing status={field.status} className="size-4" />
                                <span className="text-xs">{t(`status.${field.status}`)}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted">
                                <span aria-hidden>–</span>
                                <span className="sr-only">{t("ca.notAsked")}</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </Page>
  );
}
