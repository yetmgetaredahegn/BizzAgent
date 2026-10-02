import type { BizzAgentApi, HomeData, Me } from "../contract";
import { languageStore } from "@/lib/store";

import { accountStore, buildNewAccount, currentPersonaSeed, getDb, mutate, NEW_ACCOUNT_ID, personaStore, summariesFor, toPersona } from "./db";
import { nextBestActions } from "./journey";

const delay = <T>(value: T, ms = 120): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

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

export const mockClient: BizzAgentApi = {
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
    return delay(getDb().workspaces[workspaceId]?.inboxCount ?? 0, 10);
  },

  async home(workspaceId): Promise<HomeData> {
    const persona = currentPersonaSeed();
    const membership = persona.memberships.find((m) => m.ws === workspaceId);
    const ws = getDb().workspaces[workspaceId];
    if (!membership || !ws) throw new Error("not_found");
    const workspace = summariesFor(persona).find((w) => w.id === workspaceId)!;
    const recent = [...ws.artifacts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
    return delay({
      workspace,
      stage: ws.stage ?? "idea",
      nextActions: nextBestActions(ws, ws.flags),
      inboxCount: ws.inboxCount,
      missions: ws.missions,
      deadlines: [...ws.deadlines].sort((a, b) => a.iso.localeCompare(b.iso)),
      recent,
    });
  },
};
