"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api, MISSION_TEMPLATES, type Mission, type MissionTemplate } from "@/api";
import { useQuery } from "@/api/use-query";
import { CostTicket } from "@/components/ds/cost-ticket";
import { Page } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { EmptyState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

import { columnOf, StatusTag, StepMarker, StepMeter, type Column } from "./mission-parts";

const COLUMNS: Column[] = ["planned", "running", "waiting", "done"];

function MissionCard({ mission, wsId }: { mission: Mission; wsId: string }) {
  const { t } = useI18n();
  const msg = useMsg();
  const current = mission.tasks.find((task) => task.status === "waiting" || task.status === "running");
  return (
    <li>
      <Link
        href={`/w/${wsId}/missions/${mission.id}`}
        className="rounded-sheet group flex flex-col gap-2.5 bg-surface p-3.5 ring-1 ring-line transition-shadow hover:shadow-sheet"
      >
        <span className="flex items-start justify-between gap-2">
          <strong className="leading-snug group-hover:underline">{msg(mission.title)}</strong>
          {(mission.status === "paused" || mission.status === "cancelled") && <StatusTag status={mission.status} />}
        </span>
        <StepMeter mission={mission} />
        {current && mission.status !== "paused" && (
          <span className="text-sm text-muted">{t(`mstep.${current.step}` as MessageId)}</span>
        )}
        {mission.spent > 0 && <span className="num text-xs text-muted">{t("missions.spent", { n: mission.spent })}</span>}
      </Link>
    </li>
  );
}

function PlanPreview({ mission, onStart, onBack }: { mission: Mission; onStart: () => void; onBack: () => void }) {
  const { t } = useI18n();
  const msg = useMsg();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-semibold">{msg(mission.title)}</h3>
        <p className="text-sm text-muted">{t("missions.plan.note")}</p>
      </div>
      <ol className="flex flex-col gap-2.5">
        {mission.tasks.map((task, i) => (
          <li key={task.id} className="flex items-center gap-3">
            <StepMarker task={{ status: "pending", approval: task.approval }} index={i + 1} />
            <span className="min-w-0 flex-1">{t(`mstep.${task.step}` as MessageId)}</span>
            <span className="num text-xs text-muted">{t(`agent.${task.owner}` as MessageId)}</span>
          </li>
        ))}
      </ol>
      <CostTicket
        estimate={{ ...mission.estimate, action: msg(mission.estimate.action) }}
        onConfirm={onStart}
        confirmLabel={t("missions.start")}
        onCancel={onBack}
      />
    </div>
  );
}

function NewMissionSheet({ open, onClose, wsId }: { open: boolean; onClose: () => void; wsId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Mission | null>(null);
  const [failed, setFailed] = useState(false);

  async function planIt(input: { template?: MissionTemplate; goal?: string }) {
    setBusy(true);
    setFailed(false);
    setPlan(await api.planMission(wsId, input));
    setBusy(false);
  }

  async function start() {
    if (!plan) return;
    setBusy(true);
    try {
      await api.startMission(wsId, plan.id);
      onClose();
      router.push(`/w/${wsId}/missions/${plan.id}`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setPlan(null);
    setGoal("");
    setFailed(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title={plan ? t("missions.plan.title") : t("missions.new")}>
      {plan ? (
        <>
          <PlanPreview mission={plan} onStart={start} onBack={() => setPlan(null)} />
          {failed && (
            <p role="alert" className="mt-3 text-sm text-contradictory">
              {t("missions.start.failed")}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4" aria-busy={busy}>
          <div>
            <h3 className="num mb-2 text-xs tracking-wide text-muted uppercase">{t("missions.pickTemplate")}</h3>
            <ul className="grid gap-2 phone:grid-cols-2">
              {MISSION_TEMPLATES.map((template) => (
                <li key={template}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void planIt({ template })}
                    className="rounded-stamp flex h-full w-full flex-col gap-1 p-3 text-left ring-1 ring-line-strong hover:bg-ink/5 disabled:opacity-60"
                  >
                    <strong className="leading-snug">{t(`mission.${template}` as MessageId)}</strong>
                    <span className="text-sm text-muted">{t(`mtpl.${template}.d` as MessageId)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (goal.trim()) void planIt({ goal: goal.trim() });
            }}
          >
            <label htmlFor="mission-goal" className="num text-xs tracking-wide text-muted uppercase">
              {t("missions.orGoal")}
            </label>
            <input
              id="mission-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder={t("missions.goal.placeholder")}
              className="h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp"
            />
            <Button type="submit" variant="secondary" disabled={busy || !goal.trim()} className="w-fit">
              {t("missions.plan")}
            </Button>
          </form>
        </div>
      )}
    </Sheet>
  );
}

export function MissionsScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`missions:${workspace.id}`, () => api.listMissions(workspace.id));
  const [open, setOpen] = useState(false);

  const missions = data ?? [];
  const byColumn = (column: Column) => missions.filter((mission) => columnOf(mission.status) === column);

  return (
    <Page
      title={t("missions.title")}
      wide
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden /> {t("missions.new")}
        </Button>
      }
    >
      {data && missions.length === 0 ? (
        <EmptyState
          art="checklist"
          title={t("missions.empty.title")}
          body={t("missions.empty.body")}
          action={<Button onClick={() => setOpen(true)}>{t("missions.new")}</Button>}
        />
      ) : (
        <div className="grid items-start gap-5 tablet:grid-cols-2 desktop:grid-cols-4">
          {COLUMNS.map((column) => {
            const items = byColumn(column);
            return (
              <section
                key={column}
                aria-labelledby={`col-${column}`}
                className={cn("flex flex-col gap-2.5", items.length === 0 && "max-tablet:hidden")}
              >
                <h2 id={`col-${column}`} className="num flex items-center gap-2 text-xs tracking-wide text-muted uppercase">
                  {t(`missions.col.${column}` as MessageId)}
                  <span className="rounded-full bg-ink/8 px-1.5">{items.length}</span>
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {items.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} wsId={workspace.id} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <NewMissionSheet open={open} onClose={() => setOpen(false)} wsId={workspace.id} />
    </Page>
  );
}
