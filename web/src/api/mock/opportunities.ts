/*
 * Opportunity catalogue and the deterministic matching rules (prototype copy of
 * backend/src/bizzagent/opportunities: eligibility, ranking, scam guard).
 *
 * Every listing here is fictional demo data from fictional providers. Nothing is
 * a real grant, programme or deadline. Eligibility is plain rules over the
 * workspace's facts: the model never decides it (docs/product/platform-model.md).
 */

import type { LegalForm, Msg, Opportunity, OpportunityType, PipelineStage, WorkspaceType } from "../contract";
import type { Stage } from "@/components/ds/fidel-journey";
import type { Lang } from "@/lib/types";

import { daysFromToday } from "./clock";
import type { WsSeed } from "./seed/workspaces";

interface Conditions {
  sectors?: string[];
  stages?: Stage[];
  legalForms?: LegalForm[];
  types?: WorkspaceType[];
  towns?: string[];
  maxStaff?: number;
  needsLedger?: boolean;
}

export interface OppSeed {
  id: string;
  type: OpportunityType;
  title: string;
  provider: string;
  /** Days from the demo "today"; null for a rolling opportunity. */
  deadlineIn: number | null;
  benefit: string;
  languages: Lang[];
  source: Opportunity["source"];
  onPlatform: boolean;
  conditions: Conditions;
  scam?: string[];
}

const retrieved = daysFromToday(-2);
const platform = (domain: string): Opportunity["source"] => ({ kind: "platform", domain, retrieved });
const curated = (domain: string): Opportunity["source"] => ({ kind: "curated", domain, retrieved });
const discovered = (domain: string): Opportunity["source"] => ({ kind: "discovered", domain, retrieved });

export const CATALOGUE: OppSeed[] = [
  {
    id: "highland-agro",
    type: "grant_call",
    title: "Highland Enterprise Fund · Agro-processing call",
    provider: "Highland Enterprise Fund (demo)",
    deadlineIn: 24,
    benefit: "Br 400,000 to 1,200,000",
    languages: ["en", "am", "om"],
    source: platform("bizzagent.example/calls/highland-agro"),
    onPlatform: true,
    conditions: { sectors: ["agro"], maxStaff: 50, types: ["business"] },
  },
  {
    id: "rural-producers",
    type: "grant_call",
    title: "Rural Producers Fund · small mills",
    provider: "Rural Producers Fund (demo)",
    deadlineIn: 33,
    benefit: "Br 150,000 to 500,000",
    languages: ["en", "om"],
    source: curated("demo.example/rural-producers"),
    onPlatform: false,
    conditions: { sectors: ["agro", "milling"], towns: ["Bekoji", "Asella", "Adama"], maxStaff: 20 },
  },
  {
    id: "addis-launchpad",
    type: "accelerator",
    title: "Addis Launchpad · accelerator cohort",
    provider: "Addis Launchpad (demo)",
    deadlineIn: 19,
    benefit: "12-week programme and Br 250,000",
    languages: ["en"],
    source: platform("bizzagent.example/programmes/launchpad"),
    onPlatform: true,
    conditions: { sectors: ["software", "tech", "food"], stages: ["idea", "validated", "operating", "growing"] },
  },
  {
    id: "food-tech-weekend",
    type: "hackathon",
    title: "Addis Food-Tech Weekend",
    provider: "Food-Tech Collective (demo)",
    deadlineIn: 30,
    benefit: "Prizes up to Br 100,000",
    languages: ["en", "am"],
    source: curated("demo.example/food-tech-weekend"),
    onPlatform: false,
    conditions: { sectors: ["software", "food", "tech"] },
  },
  {
    id: "textile-fair",
    type: "trade_fair",
    title: "Addis Textile Trade Fair",
    provider: "Textile Exporters Network (demo)",
    deadlineIn: 41,
    benefit: "Stand at the fair",
    languages: ["en"],
    source: curated("demo.example/textile-fair"),
    onPlatform: false,
    conditions: { sectors: ["garment", "textile"] },
  },
  {
    id: "sme-export-tender",
    type: "tender",
    title: "SME Export Window · uniform tender",
    provider: "SME Export Window (demo)",
    deadlineIn: 12,
    benefit: "Supply contract, value on request",
    languages: ["en"],
    source: discovered("demo.example/tenders/uniforms"),
    onPlatform: false,
    conditions: { sectors: ["garment", "textile"], legalForms: ["plc", "share_company"], needsLedger: true },
  },
  {
    id: "rift-angels",
    type: "investor",
    title: "Rift Angels · seed investment",
    provider: "Rift Angels (demo)",
    deadlineIn: null,
    benefit: "Br 2,000,000 to 6,000,000",
    languages: ["en"],
    source: curated("demo.example/rift-angels"),
    onPlatform: false,
    conditions: { stages: ["operating", "growing"], needsLedger: true, types: ["business"] },
  },
  {
    id: "youth-seed",
    type: "competition",
    title: "Youth Seed Competition",
    provider: "Youth Seed (demo)",
    deadlineIn: 47,
    benefit: "Br 60,000 and mentoring",
    languages: ["en", "am", "om"],
    source: curated("demo.example/youth-seed"),
    onPlatform: false,
    conditions: { stages: ["idea", "validated"] },
  },
  {
    id: "social-fellowship",
    type: "fellowship",
    title: "Social Enterprise Fellowship",
    provider: "Learning Futures Trust (demo)",
    deadlineIn: 55,
    benefit: "Six-month fellowship",
    languages: ["en", "am"],
    source: curated("demo.example/fellowship"),
    onPlatform: false,
    conditions: { sectors: ["education", "health"], stages: ["idea", "validated", "operating"] },
  },
  {
    id: "growth-loan",
    type: "loan_product",
    title: "Smallholder Growth Loan",
    provider: "Demo Microfinance (demo)",
    deadlineIn: null,
    benefit: "Up to Br 300,000",
    languages: ["en", "am", "om"],
    source: curated("demo.example/growth-loan"),
    onPlatform: false,
    conditions: { stages: ["operating", "growing"], types: ["business"], maxStaff: 30 },
  },
  {
    id: "quick-cash",
    type: "grant_call",
    title: "Instant Business Grant: apply today",
    provider: "Unknown organiser",
    deadlineIn: 3,
    benefit: "Br 500,000, guaranteed",
    languages: ["en"],
    source: discovered("demo.example/instant-grant"),
    onPlatform: false,
    conditions: {},
    scam: ["opp.scam.fee", "opp.scam.guarantee", "opp.scam.personalPay", "opp.scam.noOrganiser"],
  },
];

const REQUIREMENTS: Record<OpportunityType, Opportunity["requirements"][number]["kind"][]> = {
  grant_call: ["profile", "legal", "finance", "proposal"],
  accelerator: ["profile", "finance", "accelerator"],
  incubator: ["profile", "idea"],
  hackathon: ["profile", "idea"],
  competition: ["profile", "idea"],
  tender: ["profile", "legal", "finance"],
  trade_fair: ["profile", "finance"],
  investor: ["profile", "finance", "growth"],
  fellowship: ["profile", "idea"],
  loan_product: ["profile", "finance", "legal"],
};

const norm = (text: string) => text.toLowerCase();
const rank = { eligible: 0, likely: 1, not: 2 } as const;

/** One condition checked against one fact: met, not met, and whether the fact is established. */
interface Check {
  ok: boolean;
  established: boolean;
  met: Msg;
  unmet: Msg;
  confirm: Msg;
}

function checksFor(ws: WsSeed, c: Conditions): Check[] {
  const checks: Check[] = [];
  const sectorKnown = ws.flags.licencePhoto;
  if (c.sectors) {
    const sector = norm(ws.profile.sector);
    checks.push({
      ok: c.sectors.some((s) => sector.includes(s)),
      established: sectorKnown,
      met: { id: "opp.ok.sector", vars: { v: ws.profile.sector } },
      unmet: { id: "opp.not.sector", vars: { v: c.sectors.join(", ") } },
      confirm: { id: "opp.confirm.sector" },
    });
  }
  if (c.stages) {
    checks.push({
      ok: !!ws.stage && c.stages.includes(ws.stage),
      established: false,
      met: { id: "opp.ok.stage", vars: { v: `@journey.${ws.stage}` } },
      unmet: { id: "opp.not.stage" },
      confirm: { id: "opp.confirm.stage" },
    });
  }
  if (c.legalForms) {
    checks.push({
      ok: !!ws.legalForm && c.legalForms.includes(ws.legalForm),
      established: ws.flags.legalFormChosen,
      met: { id: "opp.ok.legalForm" },
      unmet: { id: "opp.not.legalForm" },
      confirm: { id: "opp.confirm.legalForm" },
    });
  }
  if (c.types) {
    checks.push({ ok: c.types.includes(ws.type), established: true, met: { id: "opp.ok.type" }, unmet: { id: "opp.not.type" }, confirm: { id: "opp.confirm.type" } });
  }
  if (c.towns) {
    checks.push({
      ok: c.towns.includes(ws.profile.town),
      established: sectorKnown,
      met: { id: "opp.ok.town", vars: { v: ws.profile.town } },
      unmet: { id: "opp.not.town", vars: { v: c.towns.join(", ") } },
      confirm: { id: "opp.confirm.town" },
    });
  }
  if (c.maxStaff !== undefined && ws.profile.staff !== undefined) {
    checks.push({
      ok: ws.profile.staff <= c.maxStaff,
      established: ws.flags.ledgerBacked,
      met: { id: "opp.ok.staff", vars: { n: ws.profile.staff, max: c.maxStaff } },
      unmet: { id: "opp.not.staff", vars: { max: c.maxStaff } },
      confirm: { id: "opp.confirm.staff" },
    });
  }
  if (c.needsLedger) {
    checks.push({ ok: ws.flags.ledgerBacked, established: true, met: { id: "opp.ok.ledger" }, unmet: { id: "opp.not.ledger" }, confirm: { id: "opp.confirm.ledger" } });
  }
  return checks;
}

export function evaluateOpportunity(ws: WsSeed, seed: OppSeed, stage: PipelineStage | null): Opportunity {
  const checks = checksFor(ws, seed.conditions);
  const failed = checks.filter((check) => !check.ok);
  const unverified = checks.filter((check) => check.ok && !check.established);
  const state: Opportunity["eligibility"]["state"] = failed.length > 0 ? "not" : unverified.length > 0 ? "likely" : "eligible";
  const daysLeft = seed.deadlineIn;
  const requirements: Opportunity["requirements"] = REQUIREMENTS[seed.type].map((kind) => {
    const artifact = ws.artifacts.find((a) => a.kind === kind);
    return {
      text: { id: `opp.req.${kind}` },
      kind,
      status: !artifact ? "missing" : artifact.stamps.missing + artifact.stamps.contradictory > 0 ? "unverified" : "established",
      artifactId: artifact?.id,
    };
  });
  return {
    id: seed.id,
    type: seed.type,
    title: seed.title,
    provider: seed.provider,
    deadline: daysLeft === null ? null : daysFromToday(daysLeft),
    daysLeft,
    closingSoon: daysLeft !== null && daysLeft <= 14,
    benefit: seed.benefit,
    languages: seed.languages,
    source: seed.source,
    onPlatform: seed.onPlatform,
    eligibility: {
      state,
      reasons: state === "not" ? failed.map((check) => check.unmet) : checks.filter((check) => check.ok).map((check) => check.met),
      confirm: unverified.map((check) => check.confirm),
    },
    fit: checks.filter((check) => check.ok).map((check) => check.met).slice(0, 3),
    scam: (seed.scam ?? []).map((id) => ({ id })),
    requirements,
    stage,
    demo: true,
  };
}

/** Matches first (eligible, then likely), then by deadline; not-eligible last. A scam-flagged listing is never ranked above a clean one. */
export function rankOpportunities(list: Opportunity[]): Opportunity[] {
  return [...list].sort((a, b) => {
    const scam = Number(a.scam.length > 0) - Number(b.scam.length > 0);
    if (scam) return scam;
    const state = rank[a.eligibility.state] - rank[b.eligibility.state];
    if (state) return state;
    return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
  });
}

export const PIPELINE_SEED: Record<string, Record<string, PipelineStage>> = {
  "almaz-spices": { "highland-agro": "preparing" },
  "meron-garments": { "sme-export-tender": "shortlisted", "textile-fair": "shortlisted" },
  "abel-studio": { "addis-launchpad": "preparing", "food-tech-weekend": "shortlisted" },
};

