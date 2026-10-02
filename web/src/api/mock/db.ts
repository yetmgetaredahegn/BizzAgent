/*
 * In-memory mock database for the prototype. Reads and writes go through the
 * mock client; components subscribe through `useQuery`. Only the chosen
 * persona and a created account survive a reload (localStorage); everything
 * else resets, which is what a demo wants.
 */

import { createStore } from "@/lib/store";

import type { CreateAccountInput, Persona, WorkspaceSummary } from "../contract";
import { DEFAULT_PERSONA, PERSONAS, WORKSPACES, type PersonaSeed, type WsSeed } from "./seed/workspaces";
import type { WsFlags } from "./journey";
import type { Stage } from "@/components/ds/fidel-journey";
import { daysFromToday } from "./clock";

export const personaStore = createStore<string>("bizzagent.persona", "local", DEFAULT_PERSONA);
export const accountStore = createStore<CreateAccountInput | null>("bizzagent.account", "local", null);

const NEW_ACCOUNT_ID = "you";
const NEW_WS_ID = "you-ws";

interface Db {
  personas: Record<string, PersonaSeed>;
  workspaces: Record<string, WsSeed>;
  credits: Record<string, number>;
  version: number;
}

const listeners = new Set<() => void>();
let db: Db | null = null;

function clone<T>(value: T): T {
  return structuredClone(value);
}

const STAGE_FOR: Record<string, Stage> = { explorer: "idea", team: "idea", business: "operating", collective: "operating" };

export function buildNewAccount(input: CreateAccountInput): { persona: PersonaSeed; workspace: WsSeed } {
  const isPartner = input.path === "partner";
  const defaultName =
    input.profile?.business ||
    { explorer: "My idea", team: "My team", business: "My business", collective: "My organisation", partner: "My organisation" }[input.path];
  const gaps = 6;
  const flags: WsFlags = {
    licencePhoto: false,
    ledgerBacked: false,
    statementImported: false,
    ideaClarified: false,
    legalFormChosen: input.path === "business" && !!input.legalForm,
    interviewsDone: false,
    pendingApprovals: 0,
    profileGaps: isPartner ? 0 : gaps,
    exportInterest: false,
    hiringDraft: false,
    acceleratorFit: false,
    readiness: input.path === "business" ? 40 : 0,
    funderName: "Highland Enterprise Fund",
  };
  const facts = [input.profile?.business, input.profile?.activity, input.profile?.town, input.profile?.staff].filter(Boolean).length;
  const workspace: WsSeed = {
    id: NEW_WS_ID,
    name: defaultName,
    type: input.path,
    legalForm: input.legalForm,
    partnerKind: input.partnerKind,
    stage: isPartner ? undefined : STAGE_FOR[input.path],
    profile: {
      town: input.profile?.town ?? "",
      sector: input.profile?.activity ?? "",
      staff: input.profile?.staff,
    },
    flags,
    inboxCount: 0,
    artifacts: isPartner
      ? []
      : [
          {
            id: `${NEW_WS_ID}-profile`,
            kind: "profile",
            title: input.path === "explorer" ? "About me and my idea" : "Business profile",
            version: 1,
            completeness: Math.min(0.2 + facts * 0.1, 0.6),
            stamps: { established: 0, unverified: facts, missing: Math.max(gaps - facts, 1), contradictory: 0 },
            updatedAt: daysFromToday(0),
            producedBy: { agent: "concierge" },
          },
        ],
    missions: [],
    deadlines: [],
  };
  const persona: PersonaSeed = {
    id: NEW_ACCOUNT_ID,
    name: input.name || "Friend",
    blurb: "Your new account",
    language: input.language,
    kind: isPartner ? "partner" : "venture",
    memberships: [{ ws: NEW_WS_ID, role: isPartner ? "org_admin" : "owner", signatory: !isPartner }],
    credits: 50,
  };
  return { persona, workspace };
}

function init(): Db {
  const state: Db = {
    personas: Object.fromEntries(PERSONAS.map((p) => [p.id, clone(p)])),
    workspaces: Object.fromEntries(WORKSPACES.map((w) => [w.id, clone(w)])),
    credits: Object.fromEntries(PERSONAS.map((p) => [p.id, p.credits])),
    version: 0,
  };
  const saved = accountStore.get();
  if (saved) {
    const { persona, workspace } = buildNewAccount(saved);
    state.personas[persona.id] = persona;
    state.workspaces[workspace.id] = workspace;
    state.credits[persona.id] = persona.credits;
  }
  return state;
}

export function getDb(): Db {
  if (!db) db = init();
  return db;
}

export function mutate(change: (state: Db) => void): void {
  const state = getDb();
  change(state);
  state.version += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeDb(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dbVersion(): number {
  return getDb().version;
}

export function currentPersonaSeed(): PersonaSeed {
  const state = getDb();
  return state.personas[personaStore.get()] ?? state.personas[DEFAULT_PERSONA];
}

export function summariesFor(persona: PersonaSeed): WorkspaceSummary[] {
  const state = getDb();
  return persona.memberships.map((m) => {
    const ws = state.workspaces[m.ws];
    return {
      id: ws.id,
      name: ws.name,
      type: ws.type,
      legalForm: ws.legalForm,
      partnerKind: ws.partnerKind,
      role: m.role,
      signatory: m.signatory,
      stage: ws.stage,
    };
  });
}

export function toPersona(seed: PersonaSeed): Persona {
  return { id: seed.id, name: seed.name, blurb: seed.blurb, language: seed.language, kind: seed.kind, workspaces: summariesFor(seed) };
}

export function resetNewAccount(): void {
  mutate((state) => {
    delete state.personas[NEW_ACCOUNT_ID];
    delete state.workspaces[NEW_WS_ID];
    delete state.credits[NEW_ACCOUNT_ID];
  });
}

export { NEW_ACCOUNT_ID, NEW_WS_ID };
