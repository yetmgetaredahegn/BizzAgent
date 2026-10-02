"use client";

import { ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

import { api } from "@/api";
import { useQuery } from "@/api/use-query";
import { FidelJourney } from "@/components/ds/fidel-journey";
import { Page, Panel } from "@/components/ds/page";
import { DualDate } from "@/components/ds/format-parts";
import { EmptyState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg } from "@/i18n";
import { cn } from "@/lib/format";

import { ArtifactRow } from "./artifact-row";

export function HomeScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace, me } = useWorkspace();
  const { data } = useQuery(`home:${workspace.id}`, () => api.home(workspace.id));

  const firstName = me.name.split(" ")[0].replace(/\s*\(.*$/, "");

  return (
    <Page eyebrow={workspace.name} title={t("home.hello", { name: firstName })}>
      <FidelJourney stage={data?.stage ?? workspace.stage ?? "idea"} />

      <div className="grid gap-5 laptop:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <section aria-labelledby="next-h">
            <h2 id="next-h" className="num mb-2 text-xs tracking-wide text-muted uppercase">
              {t("home.next")}
            </h2>
            {data && data.nextActions.length === 0 ? (
              <EmptyState
                art="checklist"
                title={t("home.empty.title")}
                body={t("home.empty.body")}
                action={<ButtonLink href={`/w/${workspace.id}/talk`}>{t("home.talk")}</ButtonLink>}
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {(data?.nextActions ?? []).map((action) => (
                  <li key={action.id}>
                    <Link
                      href={action.href}
                      className={cn(
                        "rounded-sheet group flex items-center justify-between gap-3 p-4 ring-1 transition-shadow hover:shadow-sheet",
                        action.highlight ? "bg-meskel text-on-meskel ring-meskel" : "bg-surface ring-line",
                      )}
                    >
                      <span className="min-w-0">
                        <strong className="block leading-snug">{msg(action.title)}</strong>
                        <span className={cn("mt-0.5 block text-sm", action.highlight ? "text-on-meskel" : "text-muted")}>{msg(action.why)}</span>
                      </span>
                      <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Panel title={t("home.missions")} aside={<Link href={`/w/${workspace.id}/missions`} className="text-sm font-semibold text-stamp hover:underline">{t("home.missions.all")}</Link>}>
            {data && data.missions.length === 0 ? (
              <p className="text-muted">{t("home.missions.none")}</p>
            ) : (
              <ul className="ledger-rule">
                {(data?.missions ?? []).map((mission) => (
                  <li key={mission.id} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/w/${workspace.id}/missions/${mission.id}`} className="group flex flex-col gap-1.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="group-hover:underline">{msg(mission.title)}</strong>
                        <Tag highlight={mission.status === "waiting"}>{t(`mission.status.${mission.status}` as never)}</Tag>
                      </span>
                      <span
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={mission.progress.total}
                        aria-valuenow={mission.progress.done}
                        className="block h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-line"
                      >
                        <span className="block h-full bg-stamp" style={{ width: `${(mission.progress.done / mission.progress.total) * 100}%` }} />
                      </span>
                      {mission.nextStep && <span className="text-sm text-muted">{msg(mission.nextStep)}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <Panel title={t("home.inbox")}>
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-semibold">
                <Inbox className="size-5 text-stamp" aria-hidden />
                {data && data.inboxCount > 0 ? t("home.inbox.count", { n: data.inboxCount }) : t("home.inbox.zero")}
              </p>
              {data && data.inboxCount > 0 && (
                <ButtonLink href={`/w/${workspace.id}/inbox`} size="sm" variant="secondary">
                  {t("home.inbox.open")}
                </ButtonLink>
              )}
            </div>
          </Panel>

          <Panel title={t("home.deadlines")}>
            {data && data.deadlines.length === 0 ? (
              <p className="text-sm text-muted">{t("home.deadlines.none")}</p>
            ) : (
              <ul className="ledger-rule text-sm">
                {(data?.deadlines ?? []).map((d) => (
                  <li key={d.id} className="py-2 first:pt-0 last:pb-0">
                    <span className="block font-semibold">{d.title}</span>
                    <DualDate iso={d.iso} className="text-muted" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("home.recent")} aside={<Link href={`/w/${workspace.id}/file`} className="text-sm font-semibold text-stamp hover:underline">{t("home.recent.all")}</Link>}>
            <ul className="ledger-rule">
              {(data?.recent ?? []).map((a) => (
                <li key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                  <ArtifactRow artifact={a} wsId={workspace.id} compact />
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
