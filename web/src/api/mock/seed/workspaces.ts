/*
 * Fictional seed data for the eight demo personas. Every person, business and
 * funder here is invented (docs/product/personas.md). Nothing is real.
 */

import type { ArtifactKind, ArtifactSummary, Deadline, LegalForm, MissionSummary, PartnerKind, Role, WorkspaceType } from "../../contract";
import type { Stage } from "@/components/ds/fidel-journey";
import type { Lang } from "@/lib/types";

import { daysFromToday } from "../clock";
import type { WsFlags } from "../journey";

export interface WsSeed {
  id: string;
  name: string;
  type: WorkspaceType;
  legalForm?: LegalForm;
  partnerKind?: PartnerKind;
  stage?: Stage;
  profile: { town: string; sector: string; staff?: number; women?: number; years?: number };
  flags: WsFlags;
  artifacts: ArtifactSummary[];
  missions: MissionSummary[];
  deadlines: Deadline[];
}

export interface PersonaSeed {
  id: string;
  name: string;
  blurb: string;
  language: Lang;
  kind: "venture" | "partner";
  memberships: { ws: string; role: Role; signatory: boolean }[];
  credits: number;
}

function art(
  ws: string,
  kind: ArtifactKind,
  title: string,
  version: number,
  completeness: number,
  stamps: [number, number, number, number],
  daysAgo: number,
  agent?: string,
): ArtifactSummary {
  return {
    id: `${ws}-${kind}`,
    kind,
    title,
    version,
    completeness,
    stamps: { established: stamps[0], unverified: stamps[1], missing: stamps[2], contradictory: stamps[3] },
    updatedAt: daysFromToday(-daysAgo),
    producedBy: agent ? { agent } : undefined,
  };
}

const baseFlags: WsFlags = {
  licencePhoto: false,
  ledgerBacked: false,
  statementImported: false,
  ideaClarified: false,
  legalFormChosen: false,
  interviewsDone: false,
  pendingApprovals: 0,
  profileGaps: 0,
  exportInterest: false,
  hiringDraft: false,
  acceleratorFit: false,
  readiness: 0,
  funderName: "Highland Enterprise Fund",
};

export const WORKSPACES: WsSeed[] = [
  {
    id: "almaz-spices",
    name: "Almaz Spices",
    type: "business",
    legalForm: "sole_proprietorship",
    stage: "operating",
    profile: { town: "Bekoji", sector: "Agro-processing", staff: 8, women: 6, years: 6 },
    flags: { ...baseFlags, pendingApprovals: 1, profileGaps: 2, readiness: 54 },
    artifacts: [
      art("almaz-spices", "profile", "Business profile", 3, 0.78, [9, 3, 2, 0], 1, "concierge"),
      art("almaz-spices", "proposal", "Highland Enterprise Fund · Agro-processing call", 2, 0.62, [8, 6, 5, 1], 0, "funding"),
      art("almaz-spices", "finance", "Berbere margin", 1, 0.5, [0, 4, 1, 0], 3, "numbers"),
    ],
    missions: [
      {
        id: "m-almaz-funded",
        title: { id: "mission.funded" },
        status: "waiting",
        progress: { done: 4, total: 7 },
        nextStep: { id: "ms.approve" },
      },
    ],
    deadlines: [{ id: "d1", title: "Highland Enterprise Fund · Agro-processing call", iso: daysFromToday(24) }],
  },
  {
    id: "meron-garments",
    name: "Meron Garments PLC",
    type: "business",
    legalForm: "plc",
    stage: "growing",
    profile: { town: "Hawassa", sector: "Garments", staff: 25, years: 7 },
    flags: {
      ...baseFlags,
      licencePhoto: true,
      ledgerBacked: true,
      statementImported: true,
      legalFormChosen: true,
      exportInterest: true,
      hiringDraft: true,
      readiness: 71,
    },
    artifacts: [
      art("meron-garments", "profile", "Business profile", 5, 0.92, [14, 2, 0, 0], 4, "concierge"),
      art("meron-garments", "legal", "Company checklist", 2, 0.85, [7, 1, 0, 0], 20, "setup"),
      art("meron-garments", "finance", "Cash flow and margins", 4, 0.9, [11, 3, 0, 0], 2, "numbers"),
      art("meron-garments", "market", "Kenya school uniforms: market report", 2, 0.7, [5, 4, 2, 0], 1, "market"),
      art("meron-garments", "entry", "Kenya entry plan", 1, 0.55, [4, 3, 3, 0], 1, "market-entry"),
      art("meron-garments", "hiring", "Production supervisor", 1, 0.8, [6, 1, 0, 0], 0, "hiring"),
      art("meron-garments", "growth", "Growth plan 2019 EC", 2, 0.75, [6, 2, 1, 0], 6, "growth"),
    ],
    missions: [
      {
        id: "m-meron-market",
        title: { id: "mission.market" },
        status: "running",
        progress: { done: 2, total: 4 },
        nextStep: { id: "ms.running", vars: { n: 3, m: 4 } },
      },
      {
        id: "m-meron-hire",
        title: { id: "mission.hire" },
        status: "waiting",
        progress: { done: 1, total: 5 },
        nextStep: { id: "ms.approve" },
      },
    ],
    deadlines: [
      { id: "d1", title: "Addis Textile Trade Fair", iso: daysFromToday(41) },
      { id: "d2", title: "SME Export Window · tender", iso: daysFromToday(12) },
    ],
  },
  {
    id: "abel-studio",
    name: "Abel Software Studio",
    type: "business",
    legalForm: "one_member_plc",
    stage: "operating",
    profile: { town: "Addis Ababa", sector: "Software", staff: 2, years: 3 },
    flags: {
      ...baseFlags,
      licencePhoto: true,
      ledgerBacked: true,
      legalFormChosen: true,
      acceleratorFit: true,
      readiness: 63,
    },
    artifacts: [
      art("abel-studio", "profile", "Business profile", 2, 0.8, [8, 2, 1, 0], 5, "concierge"),
      art("abel-studio", "finance", "Pricing and cash flow", 3, 0.82, [7, 3, 0, 0], 2, "numbers"),
      art("abel-studio", "market", "Mobile-payments tooling: market report", 1, 0.6, [3, 4, 1, 0], 8, "market"),
      art("abel-studio", "accelerator", "Launchpad accelerator application", 1, 0.45, [2, 5, 4, 0], 0, "accelerator"),
    ],
    missions: [
      {
        id: "m-abel-accel",
        title: { id: "mission.accelerator" },
        status: "waiting",
        progress: { done: 1, total: 6 },
        nextStep: { id: "ms.answer" },
      },
    ],
    deadlines: [
      { id: "d1", title: "Addis Launchpad · accelerator cohort", iso: daysFromToday(19) },
      { id: "d2", title: "Addis Food-Tech Weekend", iso: daysFromToday(30) },
    ],
  },
  {
    id: "selam-idea",
    name: "Selam's idea",
    type: "explorer",
    stage: "idea",
    profile: { town: "Addis Ababa", sector: "Education" },
    flags: { ...baseFlags, profileGaps: 5 },
    artifacts: [
      art("selam-idea", "profile", "About me and my idea", 1, 0.4, [2, 3, 5, 0], 2, "concierge"),
      art("selam-idea", "idea", "Idea canvas", 2, 0.5, [0, 5, 3, 0], 1, "idea"),
      art("selam-idea", "launch", "Launch checklist", 1, 0.3, [0, 2, 4, 0], 6, "launch"),
    ],
    missions: [
      {
        id: "m-selam-validate",
        title: { id: "mission.validate" },
        status: "waiting",
        progress: { done: 1, total: 5 },
        nextStep: { id: "ms.answer" },
      },
    ],
    deadlines: [],
  },
  {
    id: "kuri-team",
    name: "Kuri Team",
    type: "team",
    stage: "validated",
    profile: { town: "Adama", sector: "Food delivery", staff: 3 },
    flags: { ...baseFlags, ideaClarified: true, profileGaps: 3 },
    artifacts: [
      art("kuri-team", "profile", "Team and venture profile", 1, 0.5, [3, 3, 4, 0], 3, "concierge"),
      art("kuri-team", "idea", "Idea canvas", 3, 0.8, [1, 6, 1, 0], 2, "idea"),
      art("kuri-team", "validation", "Validation plan", 2, 0.6, [0, 6, 2, 0], 1, "idea"),
      art("kuri-team", "launch", "Launch checklist", 1, 0.4, [1, 3, 4, 0], 7, "launch"),
    ],
    missions: [
      {
        id: "m-kuri-launch",
        title: { id: "mission.launch" },
        status: "running",
        progress: { done: 2, total: 5 },
        nextStep: { id: "ms.running", vars: { n: 3, m: 5 } },
      },
    ],
    deadlines: [],
  },
  {
    id: "highland",
    name: "Highland Enterprise Fund",
    type: "partner",
    partnerKind: "funder",
    profile: { town: "Addis Ababa", sector: "Funder" },
    flags: baseFlags,
    artifacts: [],
    missions: [],
    deadlines: [],
  },
  {
    id: "launchpad",
    name: "Addis Launchpad",
    type: "partner",
    partnerKind: "program",
    profile: { town: "Addis Ababa", sector: "Accelerator" },
    flags: baseFlags,
    artifacts: [],
    missions: [],
    deadlines: [],
  },
  {
    id: "bridge",
    name: "Bridge Advisors",
    type: "partner",
    partnerKind: "support_org",
    profile: { town: "Addis Ababa", sector: "Business advice" },
    flags: baseFlags,
    artifacts: [],
    missions: [],
    deadlines: [],
  },
];

export const PERSONAS: PersonaSeed[] = [
  {
    id: "selam",
    name: "Selam Bekele",
    blurb: "Explorer: a student with an idea, no business yet",
    language: "am",
    kind: "venture",
    memberships: [{ ws: "selam-idea", role: "owner", signatory: true }],
    credits: 50,
  },
  {
    id: "kuri",
    name: "Yonas (Kuri Team)",
    blurb: "Team: three co-founders, not yet registered",
    language: "en",
    kind: "venture",
    memberships: [{ ws: "kuri-team", role: "owner", signatory: true }],
    credits: 80,
  },
  {
    id: "almaz",
    name: "Almaz Wolde",
    blurb: "Sole proprietorship: spice mill, voice-first, helper Dawit",
    language: "om",
    kind: "venture",
    memberships: [{ ws: "almaz-spices", role: "owner", signatory: true }],
    credits: 120,
  },
  {
    id: "meron",
    name: "Meron Haile",
    blurb: "PLC: garment maker, three shareholders, planning export",
    language: "en",
    kind: "venture",
    memberships: [{ ws: "meron-garments", role: "owner", signatory: true }],
    credits: 540,
  },
  {
    id: "abel",
    name: "Abel Girma",
    blurb: "One-member PLC: software studio, accelerators, personal money",
    language: "en",
    kind: "venture",
    memberships: [{ ws: "abel-studio", role: "owner", signatory: true }],
    credits: 310,
  },
  {
    id: "ruth",
    name: "Ruth (Highland Enterprise Fund)",
    blurb: "Funder: publishes calls and reviews proposals",
    language: "en",
    kind: "partner",
    memberships: [{ ws: "highland", role: "program_manager", signatory: false }],
    credits: 1000,
  },
  {
    id: "daniel",
    name: "Daniel (Addis Launchpad)",
    blurb: "Programme: accelerator organiser",
    language: "en",
    kind: "partner",
    memberships: [{ ws: "launchpad", role: "org_admin", signatory: false }],
    credits: 800,
  },
  {
    id: "tigist",
    name: "Tigist (Bridge Advisors)",
    blurb: "Support organisation: advisor to 40 small businesses",
    language: "am",
    kind: "partner",
    memberships: [{ ws: "bridge", role: "mentor", signatory: false }],
    credits: 400,
  },
];

export const DEFAULT_PERSONA = "almaz";
