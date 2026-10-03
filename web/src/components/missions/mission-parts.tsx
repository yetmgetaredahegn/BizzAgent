"use client";

import { Check, Diamond } from "lucide-react";

import type { Mission, MissionStatus, MissionTask } from "@/api";
import { Tag } from "@/components/ds/tag";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

/** The board groups paused work with running work and cancelled work with done work. */
export type Column = "planned" | "running" | "waiting" | "done";

export function columnOf(status: MissionStatus): Column {
  if (status === "paused") return "running";
  if (status === "cancelled") return "done";
  return status;
}

export function progressOf(mission: Mission): { done: number; total: number } {
  return { done: mission.tasks.filter((task) => task.status === "done").length, total: mission.tasks.length };
}

export function StatusTag({ status }: { status: MissionStatus }) {
  const { t } = useI18n();
  return <Tag highlight={status === "waiting"}>{t(`missions.status.${status}` as MessageId)}</Tag>;
}

/** A row of small squares, one per step: filled when done. Honest progress, no percentage ring. */
export function StepMeter({ mission, className }: { mission: Mission; className?: string }) {
  const { t } = useI18n();
  const { done, total } = progressOf(mission);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1" role="img" aria-label={t("missions.progress", { done, total })}>
        {mission.tasks.map((task) => (
          <span
            key={task.id}
            className={cn(
              "rounded-stamp h-1.5 flex-1",
              task.status === "done" && "bg-established",
              task.status === "running" && "bg-stamp",
              task.status === "waiting" && "bg-meskel",
              task.status === "pending" && "bg-line-strong/60",
            )}
          />
        ))}
      </div>
      <span className="num text-xs text-muted">{t("missions.progress", { done, total })}</span>
    </div>
  );
}

/** Marker for one step in the plan: a check when done, a Meskel diamond when it needs the user. */
export function StepMarker({ task, index }: { task: Pick<MissionTask, "status" | "approval">; index?: number }) {
  if (task.status === "done") {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-established text-on-stamp" aria-hidden>
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (task.status === "waiting" || task.approval) {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-meskel text-on-meskel" aria-hidden>
        <Diamond className="size-3 fill-current" />
      </span>
    );
  }
  if (task.status === "running") {
    return (
      <span className="grid size-6 place-items-center rounded-full ring-2 ring-stamp" aria-hidden>
        <span className="size-2 animate-pulse rounded-full bg-stamp" />
      </span>
    );
  }
  return (
    <span className="num grid size-6 place-items-center rounded-full text-xs text-muted ring-1 ring-line-strong" aria-hidden>
      {index}
    </span>
  );
}
