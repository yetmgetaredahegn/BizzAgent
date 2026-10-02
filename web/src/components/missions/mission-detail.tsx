"use client";

import { ArrowLeft, GitFork, Pause, Play, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { api, type Mission, type MissionTask } from "@/api";
import { useQuery } from "@/api/use-query";
import { Page, Panel } from "@/components/ds/page";
import { ErrorState } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

import { StatusTag, StepMarker, StepMeter } from "./mission-parts";

function VerifierChip({ verifier }: { verifier: NonNullable<MissionTask["verifiers"]>[number] }) {
  const { t } = useI18n();
  const Icon = verifier.result === "unverified" ? TriangleAlert : ShieldCheck;
  return (
    <span
      className={cn(
        "num rounded-stamp inline-flex items-center gap-1 px-1.5 py-px text-[11px] ring-1",
        verifier.result === "pass" && "text-established ring-established/40",
        verifier.result === "revised" && "text-unverified ring-unverified/40",
        verifier.result === "unverified" && "text-contradictory ring-contradictory/40",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {t(`missions.verifier.${verifier.name}` as MessageId)} · {t(`missions.verifier.${verifier.result}` as MessageId)}
    </span>
  );
}

function Timeline({ mission, wsId }: { mission: Mission; wsId: string }) {
  const { t } = useI18n();
  return (
    <ol className="relative flex flex-col gap-4" aria-label={t("missions.timeline")}>
      <span className="absolute top-3 bottom-3 left-3 w-px bg-line-strong/60" aria-hidden />
      {mission.tasks.map((task) => (
        <li key={task.id} className="relative flex gap-3">
          <StepMarker task={task} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <strong className={cn("leading-snug", task.status === "pending" && "font-normal text-muted")}>
                {t(`mstep.${task.step}` as MessageId)}
              </strong>
              <span className="num text-xs text-muted">{t(`missions.task.${task.status}` as MessageId)}</span>
            </div>
            <span className="num text-xs text-muted">
              {t("missions.stepOwner", { who: t(`agent.${task.owner}` as MessageId) })}
            </span>
            {task.verifiers && (
              <div className="flex flex-wrap gap-1.5">
                {task.verifiers.map((verifier) => (
                  <VerifierChip key={verifier.name} verifier={verifier} />
                ))}
              </div>
            )}
            {task.status === "waiting" && (
              <Link href={`/w/${wsId}/inbox`} className="w-fit text-sm font-semibold text-stamp hover:underline">
                {t("missions.openInbox")}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MissionDetail() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const params = useParams<{ id: string }>();
  const wsId = workspace.id;
  const { data: mission, error, loading } = useQuery(`mission:${wsId}:${params.id}`, () => api.getMission(wsId, params.id));
  const { data: all } = useQuery(`missions:${wsId}`, () => api.listMissions(wsId));
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  if (error) {
    return (
      <Page>
        <ErrorState title={t("missions.notfound.title")} body={t("missions.notfound.body")} />
        <ButtonLink href={`/w/${wsId}/missions`} variant="secondary" className="w-fit">
          {t("missions.back")}
        </ButtonLink>
      </Page>
    );
  }
  if (loading || !mission) return <Page>{null}</Page>;

  const source = mission.forkedFrom ? all?.find((m) => m.id === mission.forkedFrom) : undefined;
  const live = mission.status === "running" || mission.status === "waiting";
  const closed = mission.status === "done" || mission.status === "cancelled";

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  return (
    <Page
      eyebrow={
        <Link href={`/w/${wsId}/missions`} className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="size-3.5" aria-hidden /> {t("missions.back")}
        </Link>
      }
      title={msg(mission.title)}
      actions={<StatusTag status={mission.status} />}
    >
      {source && <p className="text-sm text-muted">{t("missions.forked", { title: msg(source.title) })}</p>}

      <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title={t("missions.timeline")}>
          <Timeline mission={mission} wsId={wsId} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <StepMeter mission={mission} />
            <dl className="num mt-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("missions.spent", { n: mission.spent })}</dt>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("missions.estimate", { min: mission.estimate.creditsMin, max: mission.estimate.creditsMax })}</dt>
              </div>
            </dl>
          </Panel>

          <div className="flex flex-wrap gap-2">
            {mission.status === "planned" && (
              <Button disabled={busy} onClick={() => run(() => api.startMission(wsId, mission.id))}>
                <Play className="size-4" aria-hidden /> {t("missions.start")}
              </Button>
            )}
            {live && (
              <Button variant="secondary" disabled={busy} onClick={() => run(() => api.setMissionStatus(wsId, mission.id, "paused"))}>
                <Pause className="size-4" aria-hidden /> {t("missions.pause")}
              </Button>
            )}
            {mission.status === "paused" && (
              <Button disabled={busy} onClick={() => run(() => api.setMissionStatus(wsId, mission.id, "running"))}>
                <Play className="size-4" aria-hidden /> {t("missions.resume")}
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => run(async () => void (await api.forkMission(wsId, mission.id)))}
            >
              <GitFork className="size-4" aria-hidden /> {t("missions.fork")}
            </Button>
            {!closed && !confirmCancel && (
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                {t("missions.cancel")}
              </Button>
            )}
          </div>

          {confirmCancel && (
            <div role="alertdialog" aria-label={t("missions.cancel")} className="rounded-sheet flex flex-col gap-3 p-4 ring-1 ring-contradictory">
              <p className="text-sm">{t("missions.cancel.confirm")}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api.setMissionStatus(wsId, mission.id, "cancelled");
                      setConfirmCancel(false);
                    })
                  }
                >
                  {t("missions.cancel.yes")}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                  {t("missions.cancel.keep")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
