/*
 * Partner portal seeds: calls with immutable versions, ventures that chose to share,
 * and partner members. Every funder, programme and venture is fictional. The call
 * criteria, gate, exclusions and declarations below are demo text, not a real
 * funder's rules, and declaration wording is shown as reviewed text only.
 */

import type { CallDetail, CallVersion, Lang, PartnerMember, Role, Venture } from "../contract";
import { daysFromToday } from "./clock";

export const CRITERIA = ["impact", "viability", "team", "evidence", "feasibility"] as const;

export interface CallState extends Omit<CallDetail, "applications"> {
  applications: number;
}

const version = (v: number, daysAgo: number, note: string, weights: Record<string, number>): CallVersion => ({
  v,
  publishedAt: daysFromToday(-daysAgo),
  note,
  hash: "",
  weights,
});

const grid = (weights: Record<string, number>): CallDetail["grid"] => CRITERIA.map((id) => ({ id, label: { id: `call.crit.${id}` }, weight: weights[id] }));

const AGRO_V1 = { impact: 25, viability: 25, team: 15, evidence: 20, feasibility: 15 };
const AGRO_V2 = { impact: 25, viability: 20, team: 15, evidence: 25, feasibility: 15 };
const AGRO_V3 = { impact: 30, viability: 20, team: 10, evidence: 25, feasibility: 15 };

export const CALLS_SEED: Record<string, CallState[]> = {
  highland: [
    {
      id: "agro-2019",
      title: "Agro-processing call",
      status: "open",
      deadline: daysFromToday(24),
      languages: ["en", "am", "om"],
      submission: "on-platform",
      grid: grid(AGRO_V3),
      gate: [{ id: "call.gate.licence" }, { id: "call.gate.size" }, { id: "call.gate.years" }],
      exclusions: [{ id: "call.excl.activity" }, { id: "call.excl.double" }],
      declarations: [{ id: "call.decl.true" }, { id: "call.decl.funding" }, { id: "call.decl.visit" }],
      versions: [version(1, 60, "First publication", AGRO_V1), version(2, 40, "More weight on evidence", AGRO_V2), version(3, 21, "Impact counts for more", AGRO_V3)],
      applications: 3,
    },
    {
      id: "women-2019",
      title: "Women's enterprise window",
      status: "draft",
      deadline: daysFromToday(75),
      languages: ["en", "am"],
      submission: "on-platform",
      grid: grid(AGRO_V1),
      gate: [{ id: "call.gate.licence" }, { id: "call.gate.years" }],
      exclusions: [{ id: "call.excl.activity" }],
      declarations: [{ id: "call.decl.true" }, { id: "call.decl.funding" }],
      versions: [],
      applications: 0,
    },
  ],
  launchpad: [
    {
      id: "cohort-4",
      title: "Cohort 4 · applications",
      status: "open",
      deadline: daysFromToday(19),
      languages: ["en"],
      submission: "on-platform",
      grid: grid({ impact: 20, viability: 25, team: 25, evidence: 15, feasibility: 15 }),
      gate: [{ id: "call.gate.stage" }],
      exclusions: [],
      declarations: [{ id: "call.decl.true" }],
      versions: [version(1, 30, "First publication", { impact: 20, viability: 25, team: 25, evidence: 15, feasibility: 15 })],
      applications: 6,
    },
  ],
};

/** Sum of the weights, which must be exactly 100 to publish. */
export const totalWeight = (weights: Record<string, number>) => Object.values(weights).reduce((t, w) => t + w, 0);

export function validatePublish(weights: Record<string, number>, deadline: string, languages: Lang[]): "ok" | "weights" | "deadline" | "languages" {
  if (CRITERIA.some((id) => !Number.isInteger(weights[id]) || weights[id] < 0) || totalWeight(weights) !== 100) return "weights";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "deadline";
  if (languages.length === 0) return "languages";
  return "ok";
}

export const VENTURES_SEED: Record<string, (Omit<Venture, "readiness"> & { workspaceId: string; sharesReadiness: boolean })[]> = {
  bridge: [
    { id: "v-meron", workspaceId: "meron-garments", name: "Meron Garments PLC", stage: "growing", status: { id: "vt.s.advice" }, shared: ["Growth plan 2019 EC"], consentUntil: daysFromToday(45), sharesReadiness: true },
    { id: "v-almaz", workspaceId: "almaz-spices", name: "Almaz Spices", stage: "operating", status: { id: "vt.s.coaching" }, shared: ["Business profile", "Berbere margin"], consentUntil: daysFromToday(30), sharesReadiness: false },
    { id: "v-kuri", workspaceId: "kuri-team", name: "Kuri Team", stage: "validated", status: { id: "vt.s.intro" }, shared: ["Validation plan"], consentUntil: daysFromToday(21), sharesReadiness: false },
  ],
  launchpad: [
    { id: "v-abel", workspaceId: "abel-studio", name: "Abel Software Studio", stage: "operating", status: { id: "vt.s.applied" }, shared: ["Launchpad accelerator application"], consentUntil: daysFromToday(19), sharesReadiness: true },
    { id: "v-kuri2", workspaceId: "kuri-team", name: "Kuri Team", stage: "validated", status: { id: "vt.s.draft" }, shared: ["Idea canvas"], consentUntil: daysFromToday(19), sharesReadiness: false },
  ],
};

const pm = (id: string, name: string, role: Role, status: PartnerMember["status"] = "active"): PartnerMember => ({ id, name, role, status });

export const PARTNER_MEMBERS_SEED: Record<string, PartnerMember[]> = {
  highland: [pm("p1", "Selamawit Girma", "program_manager"), pm("p2", "Yonas Tefera", "reviewer"), pm("p3", "Rahel Desta", "reviewer"), pm("p4", "Mulugeta Assefa", "org_admin")],
  launchpad: [pm("p1", "Eden Wondimu", "org_admin"), pm("p2", "Biniam Hailu", "program_manager"), pm("p3", "Liya Fikre", "mentor", "invited")],
  bridge: [pm("p1", "Tsion Alemayehu", "mentor"), pm("p2", "Dagim Worku", "mentor"), pm("p3", "Hirut Nega", "org_admin")],
};
