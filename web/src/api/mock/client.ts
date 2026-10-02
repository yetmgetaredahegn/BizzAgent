import type {
  ActivityEvent,
  BizzAgentApi,
  HomeData,
  InboxItem,
  Me,
  Mission,
  Msg,
} from "../contract";
import { languageStore } from "@/lib/store";

import { daysFromToday } from "./clock";
import {
  accountStore,
  buildNewAccount,
  currentPersonaSeed,
  getDb,
  mutate,
  nextId,
  NEW_ACCOUNT_ID,
  personaStore,
  summariesFor,
  toPersona,
  type ConvRecord,
} from "./db";
import { nextBestActions } from "./journey";
import { advance, estimateFor, summaryOf, tasksFor, templateForGoal } from "./missions";
import { handleEvent, newConversation, type TalkEnv } from "./talk";

const delay = <T>(value: T, ms = 120): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const clone = <T>(value: T): T => structuredClone(value);

function meNow(): Me {
  const persona = currentPersonaSeed();
  return {
    personaId: persona.id,
    name: persona.name,
    language: persona.language,
    workspaces: summariesFor(persona),
    credits: getDb().credits[persona.id] ?? 0,
  };
}

const nowIso = () => `${daysFromToday(0)}T${new Date().toTimeString().slice(0, 5)}:00`;
const pendingCount = (ws: string) => (getDb().inbox[ws] ?? []).filter((i) => i.status === "pending").length;

function logActivity(ws: string, event: Omit<ActivityEvent, "id" | "at">) {
  const list = (getDb().activity[ws] ??= []);
  list.push({ id: nextId("a"), at: nowIso(), ...event });
}

function walletId(): string {
  return currentPersonaSeed().id;
}

/** Everything a conversation may change besides itself: wallet, artifacts, inbox, activity. */
function talkEnv(ws: string): TalkEnv {
  return {
    credits: () => getDb().credits[walletId()] ?? 0,
    debit: (credits) => {
      getDb().credits[walletId()] -= credits;
    },
    addInbox: (item) => {
      (getDb().inbox[ws] ??= []).push(item);
    },
    saveIdea: () => {
      const w = getDb().workspaces[ws];
      const existing = w.artifacts.find((a) => a.kind === "idea");
      const version = (existing?.version ?? 0) + 1;
      const artifact = {
        id: existing?.id ?? `${ws}-idea`,
        kind: "idea" as const,
        title: "Idea canvas",
        version,
        completeness: 0.6,
        stamps: { established: 0, unverified: 3, missing: 2, contradictory: 0 },
        updatedAt: daysFromToday(0),
        producedBy: { agent: "idea" },
      };
      if (existing) Object.assign(existing, artifact);
      else w.artifacts.push(artifact);
      w.flags.ideaClarified = true;
      logActivity(ws, { agent: "idea", action: { id: "ev.ideaSaved", vars: { n: version } }, sources: ["your answers in Talk"], credits: 0 });
      return version;
    },
    saveMarket: (market, credits) => {
      const w = getDb().workspaces[ws];
      w.artifacts = w.artifacts.filter((a) => a.id !== `${ws}-entry`);
      w.artifacts.push({
        id: `${ws}-entry`,
        kind: "entry",
        title: `${market}: entry plan`,
        version: 1,
        completeness: 0.55,
        stamps: { established: 1, unverified: 2, missing: 1, contradictory: 0 },
        updatedAt: daysFromToday(0),
        producedBy: { agent: "market-entry" },
      });
      logActivity(ws, {
        agent: "market-entry",
        action: { id: "ev.chargedResearch", vars: { market } },
        sources: ["3 sources (demo)", "your confirmed facts"],
        credits,
      });
    },
  };
}

function inboxFor(ws: string): InboxItem[] {
  const credits = getDb().credits[walletId()] ?? 0;
  return clone(getDb().inbox[ws] ?? [])
    .map((item) => (item.cost ? { ...item, cost: { ...item.cost, balanceAfter: credits - item.cost.creditsMax } } : item))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      if (a.type !== b.type) return a.type === "approval" ? -1 : 1;
      return (b.unblocks ?? 0) - (a.unblocks ?? 0);
    });
}

function missionOf(ws: string, id: string): Mission {
  const mission = (getDb().missions[ws] ?? []).find((m) => m.id === id);
  if (!mission) throw new Error("not_found");
  return mission;
}

/** After the user approves the step a mission is waiting on, run the steps up to the next one that needs them. */
function resumeMission(ws: string, missionId: string | undefined) {
  if (!missionId) return;
  const mission = (getDb().missions[ws] ?? []).find((m) => m.id === missionId);
  if (!mission) return;
  const waiting = mission.tasks.find((t) => t.status === "waiting");
  if (waiting) waiting.status = "done";
  advance(mission);
  const [min] = [estimateFor(mission.template, 0).creditsMin];
  mission.spent = Math.max(mission.spent, Math.round(min * (mission.tasks.filter((t) => t.status === "done").length / mission.tasks.length)));
}

function approvalItemFor(ws: string, mission: Mission): InboxItem | null {
  const task = mission.tasks.find((t) => t.status === "waiting");
  if (!task) return null;
  const funder = getDb().workspaces[ws].flags.funderName;
  const base = { id: nextId("i-m"), evidence: [], missionId: mission.id, status: "pending" as const };
  if (task.approval) {
    const kind = mission.template === "hire" ? "publish" : mission.template === "accelerator" ? "send" : "submit";
    const title: Msg =
      kind === "publish"
        ? { id: "inbox.publish.title", vars: { role: "new role" } }
        : kind === "send"
          ? { id: "inbox.send.title", vars: { who: "the programme (demo)" } }
          : { id: "inbox.submit.title", vars: { funder } };
    return { ...base, type: "approval", kind, title, why: { id: kind === "publish" ? "inbox.publish.why" : kind === "send" ? "inbox.send.why" : "inbox.submit.why" }, undoMinutes: 10 };
  }
  return { ...base, type: "question", kind: "ask", title: { id: "inbox.q.step", vars: { step: `@mstep.${task.step}` } }, why: { id: "inbox.q.step.why" }, unblocks: mission.tasks.filter((t) => t.status === "pending").length, sample: "Done" };
}

export const mockClient: BizzAgentApi = {
  // ---- accounts ---------------------------------------------------------------
  async listPersonas() {
    return delay(Object.values(getDb().personas).map(toPersona), 20);
  },

  async me() {
    return delay(meNow(), 30);
  },

  async setPersona(personaId) {
    const persona = getDb().personas[personaId];
    if (!persona) throw new Error(`Unknown persona ${personaId}`);
    personaStore.set(personaId);
    languageStore.set(persona.language);
    mutate(() => {});
  },

  async createAccount(input) {
    const { persona, workspace } = buildNewAccount(input);
    mutate((state) => {
      state.personas[persona.id] = persona;
      state.workspaces[workspace.id] = workspace;
      state.credits[persona.id] = persona.credits;
      state.inbox[workspace.id] = [];
      state.activity[workspace.id] = [];
      state.missions[workspace.id] = [];
    });
    accountStore.set(input);
    personaStore.set(NEW_ACCOUNT_ID);
    languageStore.set(input.language);
    return delay(meNow());
  },

  async updateLanguage(language) {
    languageStore.set(language);
    mutate((state) => {
      const persona = state.personas[personaStore.get()];
      if (persona) persona.language = language;
    });
  },

  async inboxCount(workspaceId) {
    return delay(pendingCount(workspaceId), 10);
  },

  async home(workspaceId): Promise<HomeData> {
    const persona = currentPersonaSeed();
    const membership = persona.memberships.find((m) => m.ws === workspaceId);
    const ws = getDb().workspaces[workspaceId];
    if (!membership || !ws) throw new Error("not_found");
    const workspace = summariesFor(persona).find((w) => w.id === workspaceId)!;
    const recent = [...ws.artifacts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
    const flags = { ...ws.flags, pendingApprovals: (getDb().inbox[workspaceId] ?? []).filter((i) => i.status === "pending" && i.type === "approval").length };
    return delay(
      clone({
        workspace,
        stage: ws.stage ?? "idea",
        nextActions: nextBestActions(ws, flags),
        inboxCount: pendingCount(workspaceId),
        missions: (getDb().missions[workspaceId] ?? []).filter((m) => m.status !== "cancelled").map(summaryOf),
        deadlines: [...ws.deadlines].sort((a, b) => a.iso.localeCompare(b.iso)),
        recent,
      }),
    );
  },

  // ---- conversations ----------------------------------------------------------
  async startConversation(workspaceId, topic = "general") {
    const id = nextId("conv");
    let created!: ConvRecord;
    mutate((state) => {
      created = newConversation(id, workspaceId, topic);
      state.conversations[id] = created;
    });
    return delay(clone(created.conv), 60);
  },

  async getConversation(id) {
    const rec = getDb().conversations[id];
    if (!rec) throw new Error("not_found");
    return clone(rec.conv);
  },

  async sendEvent(id, event) {
    const rec = getDb().conversations[id];
    if (!rec) throw new Error("not_found");
    mutate((state) => handleEvent(state.conversations[id], event, talkEnv(rec.conv.workspaceId)));
    return delay(clone(getDb().conversations[id].conv), 80);
  },

  // ---- inbox ---------------------------------------------------------------------
  async listInbox(workspaceId) {
    return delay(inboxFor(workspaceId), 40);
  },

  async decide(workspaceId, itemId, decision, via) {
    mutate((state) => {
      const item = (state.inbox[workspaceId] ?? []).find((i) => i.id === itemId);
      if (!item || item.status !== "pending") return;
      item.status = decision === "approve" ? "approved" : "declined";
      item.decidedVia = via;
      const personaName = currentPersonaSeed().name.split(" ")[0];
      logActivity(workspaceId, {
        agent: "you",
        action: { id: decision === "approve" ? "ev.approved" : "ev.declined", vars: { what: `@ev.kind.${item.kind}` } },
        sources: [typeof item.title === "string" ? item.title : item.title.id],
        approval: decision === "approve" ? { by: personaName, via } : undefined,
        credits: decision === "approve" ? (item.cost?.creditsMin ?? 0) : 0,
        missionId: item.missionId,
      });
      if (decision === "approve" && item.cost) state.credits[walletId()] -= item.cost.creditsMin;
      if (decision === "approve") resumeMission(workspaceId, item.missionId);
      const w = state.workspaces[workspaceId];
      if (decision === "approve" && item.kind === "submit") {
        const proposal = w.artifacts.find((a) => a.kind === "proposal");
        if (proposal) proposal.title = proposal.title.replace(/ \(submitted\)$/, "") + " (submitted)";
      }
      // A mission step that needed this approval may now be waiting on the next one.
      const mission = (state.missions[workspaceId] ?? []).find((m) => m.id === item.missionId);
      if (mission && decision === "approve") {
        const next = approvalItemFor(workspaceId, mission);
        if (next) state.inbox[workspaceId].push(next);
      }
    });
    const item = (getDb().inbox[workspaceId] ?? []).find((i) => i.id === itemId)!;
    return delay(clone(item), 60);
  },

  async batchApprove(workspaceId, itemIds) {
    const results: InboxItem[] = [];
    for (const id of itemIds) results.push(await this.decide(workspaceId, id, "approve", "tap"));
    return results;
  },

  async answerQuestion(workspaceId, itemId, answer) {
    mutate((state) => {
      const item = (state.inbox[workspaceId] ?? []).find((i) => i.id === itemId);
      if (!item || item.status !== "pending") return;
      item.status = "approved";
      item.answer = answer;
      logActivity(workspaceId, { agent: "you", action: { id: "ev.answered" }, sources: ["your answer (voice or text)"], credits: 0, missionId: item.missionId });
      const w = state.workspaces[workspaceId];
      w.flags.profileGaps = Math.max(w.flags.profileGaps - 1, 0);
      const profile = w.artifacts.find((a) => a.kind === "profile");
      if (profile && profile.stamps.missing > 0) {
        profile.stamps.missing -= 1;
        profile.stamps.unverified += 1;
        profile.completeness = Math.min(profile.completeness + 0.05, 1);
        profile.updatedAt = daysFromToday(0);
      }
      resumeMission(workspaceId, item.missionId);
      const mission = (state.missions[workspaceId] ?? []).find((m) => m.id === item.missionId);
      if (mission) {
        const next = approvalItemFor(workspaceId, mission);
        if (next) state.inbox[workspaceId].push(next);
      }
    });
    const item = (getDb().inbox[workspaceId] ?? []).find((i) => i.id === itemId)!;
    return delay(clone(item), 60);
  },

  // ---- missions --------------------------------------------------------------------
  async listMissions(workspaceId) {
    return delay(clone(getDb().missions[workspaceId] ?? []), 40);
  },

  async getMission(workspaceId, missionId) {
    return delay(clone(missionOf(workspaceId, missionId)), 30);
  },

  async planMission(workspaceId, input) {
    const template = input.template ?? templateForGoal(input.goal ?? "");
    const id = nextId("m");
    const balance = getDb().credits[walletId()] ?? 0;
    const mission: Mission = {
      id,
      workspaceId,
      template,
      title: input.goal && !input.template ? input.goal : { id: `mission.${template}` },
      status: "planned",
      tasks: tasksFor(id, template, 0, true),
      estimate: estimateFor(template, balance),
      spent: 0,
    };
    mutate((state) => {
      (state.missions[workspaceId] ??= []).push(mission);
    });
    return delay(clone(mission), 150);
  },

  async startMission(workspaceId, missionId) {
    const mission = missionOf(workspaceId, missionId);
    if ((getDb().credits[walletId()] ?? 0) < mission.estimate.creditsMax) throw new Error("insufficient_credits");
    mutate((state) => {
      const m = (state.missions[workspaceId] ?? []).find((x) => x.id === missionId)!;
      advance(m);
      const done = m.tasks.filter((t) => t.status === "done").length;
      const spent = Math.round(m.estimate.creditsMin * (done / m.tasks.length));
      m.spent = spent;
      state.credits[walletId()] -= spent;
      const next = approvalItemFor(workspaceId, m);
      if (next) (state.inbox[workspaceId] ??= []).push(next);
    });
    return delay(clone(missionOf(workspaceId, missionId)), 150);
  },

  async setMissionStatus(workspaceId, missionId, status) {
    mutate((state) => {
      const m = (state.missions[workspaceId] ?? []).find((x) => x.id === missionId)!;
      if (status === "running") m.status = m.tasks.some((t) => t.status === "waiting") ? "waiting" : "running";
      else m.status = status;
    });
    return delay(clone(missionOf(workspaceId, missionId)), 60);
  },

  async forkMission(workspaceId, missionId) {
    const source = missionOf(workspaceId, missionId);
    const id = nextId("m");
    const fork: Mission = {
      ...clone(source),
      id,
      status: "planned",
      spent: 0,
      forkedFrom: source.id,
      tasks: source.tasks.map((t, i) => ({ ...t, id: `${id}-t${i}`, status: t.status === "done" ? "done" : "pending" })),
    };
    mutate((state) => {
      (state.missions[workspaceId] ??= []).push(fork);
    });
    return delay(clone(fork), 100);
  },

  // ---- activity --------------------------------------------------------------------
  async listActivity(workspaceId) {
    return delay([...clone(getDb().activity[workspaceId] ?? [])].sort((a, b) => b.at.localeCompare(a.at)), 40);
  },
};
