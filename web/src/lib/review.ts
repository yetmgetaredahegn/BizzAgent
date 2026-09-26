/*
 * Reviewer path: rank a batch into shortlist, reserve and excluded, and
 * move batches in and out as JSON or CSV.
 */

import { analyzePack, type PackAnalysis } from "./analyze";
import { emptyApplication, emptyImpact } from "./fixtures/build";
import { GRID_VARIANTS, SHORTLIST_SIZE } from "./grid";
import type { ApplicationPack } from "./types";

export type ReviewStatus = "shortlist" | "reserve" | "excluded";
export type ReviewSource = "batch" | "submitted" | "imported";

export interface RankedApplication {
  pack: ApplicationPack;
  analysis: PackAnalysis;
  rank: number | null;
  status: ReviewStatus;
  source: ReviewSource;
}

export function rankBatch(
  entries: { pack: ApplicationPack; source: ReviewSource }[],
): RankedApplication[] {
  const analysed = entries.map(({ pack, source }) => ({ pack, source, analysis: analyzePack(pack) }));

  const eligible = analysed
    .filter((e) => e.analysis.evaluation.eligibility !== "excluded")
    .sort((a, b) => b.analysis.evaluation.total - a.analysis.evaluation.total);
  const excluded = analysed
    .filter((e) => e.analysis.evaluation.eligibility === "excluded")
    .sort((a, b) => b.analysis.evaluation.total - a.analysis.evaluation.total);

  return [
    ...eligible.map((e, index) => ({
      ...e,
      rank: index + 1,
      status: (index < SHORTLIST_SIZE ? "shortlist" : "reserve") as ReviewStatus,
    })),
    ...excluded.map((e) => ({ ...e, rank: null, status: "excluded" as const })),
  ];
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function shortlistCsv(ranked: RankedApplication[]): string {
  const header = [
    "Rank",
    "Status",
    "Company",
    "Town",
    "Region",
    "Grid",
    "Score",
    "Other grid score",
    "Eligibility",
    "Contradictions",
    "Points resting on applicant's word",
    "Site-visit questions",
    "Justification",
  ];
  const rows = ranked.map(({ pack, analysis, rank, status }) => {
    const e = analysis.evaluation;
    return [
      rank ?? "",
      status,
      pack.data.applicant.company_profile.company_name,
      pack.context.town,
      pack.context.region,
      GRID_VARIANTS[e.variant].name,
      Math.round(e.total),
      Math.round(e.otherVariant.total),
      e.eligibility,
      analysis.contradictions.map((c) => c.title).join("; "),
      Math.round(e.provisionalPoints),
      e.siteVisitQuestions.join(" | "),
      e.justification,
    ];
  });
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Accept an imported pack only if it has the application shape. Missing
 * parts are filled with empty values, never with guesses.
 */
export function normalizePack(raw: unknown, index: number): ApplicationPack | null {
  if (!isObject(raw) || !isObject(raw.data) || !isObject(raw.data.applicant)) return null;
  const base = emptyApplication();
  const data = raw.data as unknown as ApplicationPack["data"];
  const applicant = data.applicant;
  const id = typeof raw.id === "string" && raw.id ? raw.id : `imported-${index + 1}`;

  return {
    id: `imp-${id}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
    kind: "imported",
    language: raw.language === "am" || raw.language === "om" ? raw.language : "en",
    persona: isObject(raw.persona) ? (raw.persona as unknown as ApplicationPack["persona"]) : undefined,
    data: {
      applicant: {
        ...base.applicant,
        ...applicant,
        company_profile: { ...base.applicant.company_profile, ...applicant.company_profile },
        company_overview: { ...base.applicant.company_overview, ...applicant.company_overview },
        management: { ...base.applicant.management, ...applicant.management },
      },
      intervention: { ...base.intervention, ...data.intervention },
      evidence: Array.isArray(data.evidence) ? data.evidence : [],
    },
    licence: {
      licence_number: null,
      registration_date: null,
      valid_until: null,
      business_activity: null,
      ...(isObject(raw.licence) ? raw.licence : {}),
    },
    documents: isObject(raw.documents) ? (raw.documents as ApplicationPack["documents"]) : undefined,
    context: {
      region: null,
      town: null,
      sector_category: null,
      prior_funding_same_intervention: null,
      ...(isObject(raw.context) ? raw.context : {}),
    },
    impact: { ...emptyImpact(), ...(isObject(raw.impact) ? raw.impact : {}) },
    provenance: isObject(raw.provenance)
      ? (raw.provenance as ApplicationPack["provenance"])
      : {},
  };
}

export function parseBatch(json: string): { packs: ApplicationPack[]; rejected: number } {
  const parsed: unknown = JSON.parse(json);
  const list = Array.isArray(parsed) ? parsed : isObject(parsed) && Array.isArray(parsed.applications) ? parsed.applications : null;
  if (!list) throw new Error("Expected a JSON array of applications, or { \"applications\": [...] }.");
  const packs: ApplicationPack[] = [];
  let rejected = 0;
  list.forEach((item, index) => {
    const pack = normalizePack(item, index);
    if (pack) packs.push(pack);
    else rejected += 1;
  });
  return { packs, rejected };
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
