import type { ApplicationPack } from "../types";
import { BATCH_EXTRAS } from "./batch";
import { PERSONA_PACKS } from "./personas";

export { almaz, hiwot, nahom } from "./personas";

export const DEMO_CASE_IDS = ["almaz", "nahom", "hiwot"] as const;
export type DemoCaseId = (typeof DEMO_CASE_IDS)[number];

export function isDemoCase(id: string): id is DemoCaseId {
  return (DEMO_CASE_IDS as readonly string[]).includes(id);
}

export function getDemoPack(id: string): ApplicationPack | undefined {
  return PERSONA_PACKS.find((pack) => pack.id === id);
}

/** The reviewer path's demo batch: the three personas plus nine others. */
export const REVIEW_BATCH: ApplicationPack[] = [...PERSONA_PACKS, ...BATCH_EXTRAS];

export const REVIEW_BATCH_NAME = "Call 2026-Q3 · Ethiopia MSME window";
