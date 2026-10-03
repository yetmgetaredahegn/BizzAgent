/*
 * Passport shares. A share is a link with a scope, an expiry and a revoke switch, and
 * every view is logged. Shares live in localStorage in the prototype so the public
 * /passport/[token] page works in another tab (docs/product/platform-model.md).
 */

import { createStore } from "@/lib/store";

import type { PassportShare } from "../contract";
import { DEMO_TODAY, daysFromToday } from "./clock";

export interface StoredShare extends Omit<PassportShare, "state"> {
  workspaceId: string;
}

export const passportStore = createStore<StoredShare[]>("bizzagent.passport", "local", []);

/** Demo shares that exist before anyone creates one, so the public page can be tried straight away. */
const SEEDED: StoredShare[] = [
  { id: "sh-seed-almaz", token: "demo-almaz", workspaceId: "almaz-spices", scope: "basic", createdAt: daysFromToday(-6), expiresAt: daysFromToday(24), revoked: false, views: [] },
  { id: "sh-seed-meron", token: "demo-meron", workspaceId: "meron-garments", scope: "full", createdAt: daysFromToday(-10), expiresAt: daysFromToday(20), revoked: false, views: [{ at: `${daysFromToday(-4)}T10:12:00`, who: { id: "pp.viewer.link" } }] },
  { id: "sh-seed-old", token: "demo-expired", workspaceId: "meron-garments", scope: "basic", createdAt: daysFromToday(-60), expiresAt: daysFromToday(-30), revoked: false, views: [] },
];

export function allShares(): StoredShare[] {
  const stored = passportStore.get();
  const overridden = new Set(stored.map((s) => s.id));
  return [...stored, ...SEEDED.filter((s) => !overridden.has(s.id))];
}

export function sharesFor(workspaceId: string): StoredShare[] {
  return allShares().filter((s) => s.workspaceId === workspaceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveShare(share: StoredShare): void {
  passportStore.set((previous) => [share, ...previous.filter((s) => s.id !== share.id)]);
}

export function newToken(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
}

export type ShareState = PassportShare["state"];

/** A share is valid only if it is not revoked and today is on or before its expiry. */
export function shareState(share: Pick<PassportShare, "expiresAt" | "revoked">, today: string = DEMO_TODAY): ShareState {
  if (share.revoked) return "revoked";
  return share.expiresAt < today ? "expired" : "ok";
}
