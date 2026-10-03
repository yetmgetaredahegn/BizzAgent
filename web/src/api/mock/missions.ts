/*
 * Mission templates and the helpers that turn a plan into tasks. A mission is
 * a multi-skill goal: a list of steps, some owned by an agent and some that
 * wait for the user's approval (docs/architecture/agent-operating-model.md §3).
 */

import type { CostEstimateDto, Mission, MissionStatus, MissionSummary, MissionTask, MissionTemplate } from "../contract";

interface StepDef {
  step: string;
  agent: string;
  approval?: boolean;
}

export const TEMPLATE_STEPS: Record<MissionTemplate, StepDef[]> = {
  funded: [
    { step: "readiness", agent: "funding" },
    { step: "gaps", agent: "funding" },
    { step: "commonapp", agent: "funding" },
    { step: "panel", agent: "funding" },
    { step: "approve", agent: "you", approval: true },
    { step: "submit", agent: "funding" },
    { step: "track", agent: "funding" },
  ],
  register: [
    { step: "checklist", agent: "setup" },
    { step: "forms", agent: "setup" },
    { step: "approve", agent: "you", approval: true },
    { step: "reminders", agent: "concierge" },
  ],
  launch: [
    { step: "prereg", agent: "launch" },
    { step: "techchecklist", agent: "launch" },
    { step: "landing", agent: "launch" },
    { step: "experiments", agent: "idea" },
    { step: "decide", agent: "you" },
  ],
  accelerator: [
    { step: "fit", agent: "accelerator" },
    { step: "draft", agent: "accelerator" },
    { step: "video", agent: "accelerator" },
    { step: "mock", agent: "accelerator" },
    { step: "approve", agent: "you", approval: true },
    { step: "track", agent: "accelerator" },
  ],
  market: [
    { step: "research", agent: "market" },
    { step: "entrymode", agent: "market-entry" },
    { step: "pilot", agent: "market-entry" },
    { step: "decide", agent: "you" },
  ],
  validate: [
    { step: "assumptions", agent: "idea" },
    { step: "script", agent: "idea" },
    { step: "log", agent: "you" },
    { step: "synthesise", agent: "idea" },
    { step: "experiments", agent: "idea" },
  ],
  hire: [
    { step: "jd", agent: "hiring" },
    { step: "approve", agent: "you", approval: true },
    { step: "post", agent: "hiring" },
    { step: "screen", agent: "hiring" },
    { step: "offer", agent: "hiring" },
  ],
  monthly: [
    { step: "import", agent: "numbers" },
    { step: "categorise", agent: "you" },
    { step: "digest", agent: "numbers" },
  ],
};

export const TEMPLATE_ESTIMATE: Record<MissionTemplate, [number, number]> = {
  funded: [30, 45],
  register: [10, 16],
  launch: [8, 12],
  accelerator: [20, 30],
  market: [18, 24],
  validate: [6, 10],
  hire: [12, 18],
  monthly: [4, 8],
};

const GOAL_HINTS: [RegExp, MissionTemplate][] = [
  [/fund|grant|loan|money|ገንዘብ|ፈንድ|maallaq|deeggars/i, "funded"],
  [/regist|licen|plc|ፈቃድ|ምዝገባ|galmee/i, "register"],
  [/launch|mvp|app|ማስጀመር/i, "launch"],
  [/accelerat|incubat|hackathon|yc|አክሰለ/i, "accelerator"],
  [/market|export|kenya|ገበያ|gabaa/i, "market"],
  [/idea|validate|customer|ሀሳብ|yaada/i, "validate"],
  [/hire|staff|job|worker|ቅጥር|qacar/i, "hire"],
  [/month|close|statement|ወር|ji'a/i, "monthly"],
];

/** Picks the closest template for a goal sentence (the real planner proposes a DAG and a validator checks it). */
export function templateForGoal(goal: string): MissionTemplate {
  return GOAL_HINTS.find(([pattern]) => pattern.test(goal))?.[1] ?? "funded";
}

export function estimateFor(template: MissionTemplate, balance: number): CostEstimateDto {
  const [min, max] = TEMPLATE_ESTIMATE[template];
  return {
    action: { id: `mission.${template}` },
    creditsMin: min,
    creditsMax: max,
    balanceAfter: balance - max,
    capRemaining: 300,
  };
}

function verifiersFor(index: number): MissionTask["verifiers"] {
  const base: NonNullable<MissionTask["verifiers"]> = [
    { name: "grounding", result: "pass" },
    { name: "language", result: "pass" },
  ];
  if (index % 3 === 1) base.push({ name: "rules", result: "revised" });
  else base.push({ name: "policy", result: "pass" });
  return base;
}

/** Task list for a template given how many steps are done and whether the next one waits for the user. */
export function tasksFor(missionId: string, template: MissionTemplate, done: number, pausedOrPlanned = false): MissionTask[] {
  return TEMPLATE_STEPS[template].map((def, i) => {
    let status: MissionTask["status"] = "pending";
    if (i < done) status = "done";
    else if (i === done && !pausedOrPlanned) status = def.approval || def.agent === "you" ? "waiting" : "running";
    return {
      id: `${missionId}-t${i}`,
      step: def.step,
      owner: def.agent,
      status,
      approval: def.approval,
      verifiers: status === "done" && def.agent !== "you" ? verifiersFor(i) : undefined,
    };
  });
}

export function missionFromSummary(workspaceId: string, summary: MissionSummary): Mission {
  const template = (typeof summary.title === "object" ? summary.title.id.split(".")[1] : "funded") as MissionTemplate;
  const [min, max] = TEMPLATE_ESTIMATE[template];
  const total = TEMPLATE_STEPS[template].length;
  const done = Math.min(summary.progress.done, total);
  return {
    id: summary.id,
    workspaceId,
    template,
    title: summary.title,
    status: summary.status as MissionStatus,
    tasks: tasksFor(summary.id, template, done),
    estimate: { action: summary.title, creditsMin: min, creditsMax: max, balanceAfter: 0, capRemaining: 300 },
    spent: Math.round(((min + max) / 2) * (done / total)),
  };
}

export function summaryOf(mission: Mission): MissionSummary {
  const total = mission.tasks.length;
  const done = mission.tasks.filter((t) => t.status === "done").length;
  const current = mission.tasks.find((t) => t.status === "waiting" || t.status === "running");
  let nextStep: MissionSummary["nextStep"];
  if (current?.status === "waiting") nextStep = { id: current.approval ? "ms.approve" : "ms.answer" };
  else if (current) nextStep = { id: "ms.running", vars: { n: done + 1, m: total } };
  const status = (mission.status === "cancelled" ? "done" : mission.status) as MissionSummary["status"];
  return { id: mission.id, title: mission.title as MissionSummary["title"], status, progress: { done, total }, nextStep };
}

/** Run steps until the next one that needs the user, or until only the last step is left. */
export function advance(mission: Mission): void {
  const tasks = mission.tasks;
  const total = tasks.length;
  let i = tasks.findIndex((t) => t.status !== "done");
  while (i !== -1 && i < total) {
    const task = tasks[i];
    if (task.approval || task.owner === "you") {
      task.status = "waiting";
      mission.status = "waiting";
      return;
    }
    if (i === total - 1) {
      task.status = "running";
      mission.status = "running";
      return;
    }
    task.status = "done";
    task.verifiers = verifiersFor(i);
    i += 1;
  }
  mission.status = "done";
}
