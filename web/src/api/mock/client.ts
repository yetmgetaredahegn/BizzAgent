import type {
  ActivityEvent,
  ArtifactDetail,
  BizzAgentApi,
  HomeData,
  InboxItem,
  Me,
  Mission,
  Msg,
  Opportunity,
  PassportShare,
} from "../contract";
import { breakEven, grossMargin, markup } from "@/lib/calc";
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
import { buildDetail } from "./artifacts";
import { documentDraftsFor, documentText, publicView, sha256Hex, type DocumentDraft } from "./documents";
import { CATALOGUE, evaluateOpportunity, rankOpportunities } from "./opportunities";
import { allShares, newToken, saveShare, sharesFor, shareState, type StoredShare } from "./passport";
import { commonApplicationOf, readinessOf } from "./trust";
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

/** The detail of an artifact: built from the seed on first read, rebuilt if its version changed (for example after Talk). */
function detailOf(ws: string, id: string): ArtifactDetail {
  const state = getDb();
  const seed = state.workspaces[ws];
  const summary = seed?.artifacts.find((a) => a.id === id);
  if (!summary) throw new Error("not_found");
  const cached = state.details[id];
  if (cached && cached.version === summary.version) return cached;
  const built = buildDetail(seed, summary);
  state.details[id] = built;
  return built;
}

function changeDetail<K extends ArtifactDetail["kind"]>(ws: string, id: string, kind: K, change: (detail: Extract<ArtifactDetail, { kind: K }>) => void): ArtifactDetail {
  detailOf(ws, id);
  mutate((state) => {
    const detail = state.details[id];
    if (detail.kind === kind) change(detail as Extract<ArtifactDetail, { kind: K }>);
  });
  return detailOf(ws, id);
}

/** Every catalogue entry evaluated for one workspace, with its place in the pipeline. */
function opportunitiesOf(ws: string): Opportunity[] {
  const state = getDb();
  const seed = state.workspaces[ws];
  if (!seed) throw new Error("not_found");
  const pipeline = state.pipeline[ws] ?? {};
  return CATALOGUE.map((entry) => evaluateOpportunity(seed, entry, pipeline[entry.id] ?? null));
}

/** Home shows the deadlines of opportunities that are still open in the pipeline. */
function deadlinesFor(ws: string): HomeData["deadlines"] {
  return opportunitiesOf(ws)
    .filter((o) => o.stage && o.stage !== "submitted" && o.stage !== "outcome" && o.deadline)
    .map((o) => ({ id: o.id, title: o.title, iso: o.deadline! }))
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

const BASIC_FACTS = new Set(["pf.business", "pf.town", "pf.sector", "pf.legalForm", "pf.licence"]);

function toDto(share: StoredShare): PassportShare {
  const { workspaceId, ...rest } = share;
  void workspaceId;
  return { ...rest, state: shareState(share) };
}

/** Every workspace's documents, for the public verification page. */
function findDocument(id: string): { draft: DocumentDraft; issuer: string } | null {
  for (const ws of Object.values(getDb().workspaces)) {
    const draft = documentDraftsFor(ws).find((d) => d.id === id);
    if (draft) return { draft, issuer: ws.name };
  }
  return null;
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
    const flags = { ...ws.flags, readiness: readinessOf(ws).score, pendingApprovals: (getDb().inbox[workspaceId] ?? []).filter((i) => i.status === "pending" && i.type === "approval").length };
    return delay(
      clone({
        workspace,
        stage: ws.stage ?? "idea",
        nextActions: nextBestActions(ws, flags),
        inboxCount: pendingCount(workspaceId),
        missions: (getDb().missions[workspaceId] ?? []).filter((m) => m.status !== "cancelled").map(summaryOf),
        deadlines: deadlinesFor(workspaceId),
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

  // ---- artifacts -------------------------------------------------------------------
  async listArtifacts(workspaceId) {
    return delay(clone(getDb().workspaces[workspaceId]?.artifacts ?? []), 40);
  },

  async getArtifact(workspaceId, artifactId) {
    return delay(clone(detailOf(workspaceId, artifactId)), 40);
  },

  async calc(name, inputs) {
    const result =
      name === "margin" ? grossMargin(inputs.price, inputs.cost) : name === "markup" ? markup(inputs.price, inputs.cost) : breakEven(inputs.fixed, inputs.price, inputs.cost);
    return delay({ value: result.value, unit: result.unit, steps: result.steps, warnings: result.warnings }, 30);
  },

  async approveIdea(workspaceId, artifactId, version) {
    const detail = changeDetail(workspaceId, artifactId, "idea", (d) => {
      const v = d.versions.find((x) => x.n === version);
      if (v) v.approved = true;
    });
    logActivity(workspaceId, { agent: "you", action: { id: "ev.ideaApproved", vars: { n: version } }, sources: ["idea canvas"], credits: 0 });
    return delay(clone(detail), 60);
  },

  async toggleChecklistItem(workspaceId, artifactId, itemId, done) {
    const flip = (items: { id: string; done: boolean }[]) => {
      const item = items.find((x) => x.id === itemId);
      if (item) item.done = done;
    };
    let detail = changeDetail(workspaceId, artifactId, "legal", (d) => flip(d.steps));
    detail = changeDetail(workspaceId, artifactId, "launch", (d) => flip([...d.legal, ...d.technical]));
    return delay(clone(detail), 40);
  },

  async saveDraft(workspaceId, artifactId, questionId, text) {
    const detail = changeDetail(workspaceId, artifactId, "accelerator", (d) => {
      const q = d.questions.find((x) => x.id === questionId);
      if (q) q.draft = text;
    });
    return delay(clone(detail), 40);
  },

  async explainerAction(workspaceId, artifactId, clauseId, action) {
    const detail = changeDetail(workspaceId, artifactId, "explainer", (d) => {
      const c = d.clauses.find((x) => x.id === clauseId);
      if (c) c.done = action;
    });
    logActivity(workspaceId, { agent: "explainer", action: { id: `ev.explainer.${action}` }, sources: ["document explanation"], credits: 0 });
    return delay(clone(detail), 40);
  },

  // ---- opportunities ----------------------------------------------------------------
  async listOpportunities(workspaceId, filters) {
    let list = rankOpportunities(opportunitiesOf(workspaceId));
    if (filters?.type) list = list.filter((o) => o.type === filters.type);
    if (filters?.closingSoon) list = list.filter((o) => o.closingSoon);
    return delay(clone(list), 60);
  },

  async getOpportunity(workspaceId, opportunityId) {
    const found = opportunitiesOf(workspaceId).find((o) => o.id === opportunityId);
    if (!found) throw new Error("not_found");
    return delay(clone(found), 40);
  },

  async setPipelineStage(workspaceId, opportunityId, stage) {
    mutate((state) => {
      const pipeline = (state.pipeline[workspaceId] ??= {});
      if (stage) pipeline[opportunityId] = stage;
      else delete pipeline[opportunityId];
    });
    const found = opportunitiesOf(workspaceId).find((o) => o.id === opportunityId)!;
    if (stage) logActivity(workspaceId, { agent: "funding", action: { id: "ev.pipeline", vars: { title: found.title, stage: `@pipe.${stage}` } }, sources: [found.source.domain], credits: 0 });
    return delay(clone(found), 40);
  },

  async reportOpportunity(workspaceId, opportunityId) {
    const found = opportunitiesOf(workspaceId).find((o) => o.id === opportunityId);
    if (found) logActivity(workspaceId, { agent: "you", action: { id: "ev.reported", vars: { title: found.title } }, sources: [found.source.domain], credits: 0 });
    return delay(undefined, 40);
  },

  // ---- readiness, common application, passport ------------------------------------
  async getReadiness(workspaceId) {
    const ws = getDb().workspaces[workspaceId];
    if (!ws) throw new Error("not_found");
    return delay(clone(readinessOf(ws)), 40);
  },

  async getCommonApplication(workspaceId) {
    const ws = getDb().workspaces[workspaceId];
    if (!ws) throw new Error("not_found");
    return delay(clone(commonApplicationOf(ws, rankOpportunities(opportunitiesOf(workspaceId)))), 40);
  },

  async getPassport(workspaceId) {
    const ws = getDb().workspaces[workspaceId];
    if (!ws) throw new Error("not_found");
    const profile = ws.artifacts.find((a) => a.kind === "profile");
    const detail = profile ? detailOf(workspaceId, profile.id) : null;
    return delay(
      clone({ business: ws.name, facts: detail?.kind === "profile" ? detail.rows : [], shares: sharesFor(workspaceId).map(toDto) }),
      40,
    );
  },

  async createShare(workspaceId, input) {
    const share: StoredShare = {
      id: nextId("sh"),
      token: newToken(),
      workspaceId,
      scope: input.scope,
      createdAt: daysFromToday(0),
      expiresAt: daysFromToday(input.days),
      revoked: false,
      views: [],
    };
    saveShare(share);
    logActivity(workspaceId, { agent: "you", action: { id: "ev.passportShared" }, sources: ["Passport"], credits: 0 });
    mutate(() => {});
    return delay(toDto(share), 60);
  },

  async revokeShare(workspaceId, shareId) {
    const share = sharesFor(workspaceId).find((s) => s.id === shareId);
    if (share) saveShare({ ...share, revoked: true });
    logActivity(workspaceId, { agent: "you", action: { id: "ev.passportRevoked" }, sources: ["Passport"], credits: 0 });
    mutate(() => {});
    return delay(undefined, 30);
  },

  async openSharedPassport(token) {
    const share = allShares().find((s) => s.token === token);
    if (!share) return delay({ state: "unknown" as const }, 40);
    const state = shareState(share);
    if (state !== "ok") return delay({ state }, 40);
    const ws = getDb().workspaces[share.workspaceId];
    const profile = ws?.artifacts.find((a) => a.kind === "profile");
    const detail = ws && profile ? detailOf(ws.id, profile.id) : null;
    const rows = detail?.kind === "profile" ? detail.rows : [];
    const facts = share.scope === "full" ? rows : rows.filter((row) => typeof row.key === "object" && BASIC_FACTS.has(row.key.id));
    saveShare({ ...share, views: [...share.views, { at: `${daysFromToday(0)}T${new Date().toTimeString().slice(0, 5)}:00`, who: { id: "pp.viewer.link" } }] });
    return delay(clone({ state: "ok" as const, business: ws?.name ?? "", facts, expiresAt: share.expiresAt }), 40);
  },

  // ---- documents --------------------------------------------------------------------
  async listDocuments(workspaceId) {
    const ws = getDb().workspaces[workspaceId];
    if (!ws) throw new Error("not_found");
    const records = await Promise.all(
      documentDraftsFor(ws).map(async (draft) => ({ ...draft, hash: await sha256Hex(documentText(draft, ws.name)) })),
    );
    return clone(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async getDocumentText(documentId) {
    const found = findDocument(documentId);
    if (!found) throw new Error("not_found");
    return documentText(found.draft, found.issuer);
  },

  async getPublicDocument(documentId) {
    const found = findDocument(documentId);
    return delay(found ? publicView(found.draft, found.issuer) : null, 40);
  },

  async verifyDocument(documentId, sha256) {
    const found = findDocument(documentId);
    if (!found) throw new Error("not_found");
    return (await sha256Hex(documentText(found.draft, found.issuer))) === sha256 ? "match" : "altered";
  },

  // ---- activity --------------------------------------------------------------------
  async listActivity(workspaceId) {
    return delay([...clone(getDb().activity[workspaceId] ?? [])].sort((a, b) => b.at.localeCompare(a.at)), 40);
  },
};
