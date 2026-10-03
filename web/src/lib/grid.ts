/*
 * Scoring grid configuration.
 *
 * ILLUSTRATIVE: the funder's official grid (nine weighted criteria, eligibility
 * gate and three exclusion factors) is not in this repository yet. The
 * criteria below follow the application form so the screens can be built and
 * demonstrated; replace names, weights and thresholds with the official grid.
 * The evaluator in evaluate.ts moves to the backend rules package (bizzagent.rules).
 */

import type { ApplicationPack, SectorCategory } from "./types";

export type CriterionId =
  | "growth"
  | "jobs"
  | "inclusion"
  | "uniqueness"
  | "market"
  | "local_inputs"
  | "management"
  | "intervention"
  | "impact_osh";

export interface CriterionDefinition {
  id: CriterionId;
  label: string;
  question: string;
  /** Form fields the rating is computed from. All must be usable to score. */
  inputs: string[];
}

export const CRITERIA: CriterionDefinition[] = [
  {
    id: "growth",
    label: "Growth track record",
    question: "Have sales grown over the years on record?",
    inputs: ["company_overview.growth_indicators"],
  },
  {
    id: "jobs",
    label: "Job creation",
    question: "How many new jobs will the intervention create?",
    inputs: ["intervention.job_positions"],
  },
  {
    id: "inclusion",
    label: "Women & youth inclusion",
    question: "How many women and young people work in the business?",
    inputs: ["company_overview.growth_indicators"],
  },
  {
    id: "uniqueness",
    label: "Product uniqueness",
    question: "Is the product or service new or different from competitors?",
    inputs: ["product_uniqueness"],
  },
  {
    id: "market",
    label: "Market reach",
    question: "How many distinct markets does the business already serve?",
    inputs: ["products_services"],
  },
  {
    id: "local_inputs",
    label: "Local raw materials",
    question: "What share of inputs is sourced in Ethiopia?",
    inputs: ["local_raw_material_percentage"],
  },
  {
    id: "management",
    label: "Management capacity",
    question: "Is there a core team and a clear organisation?",
    inputs: ["management.core_management_team"],
  },
  {
    id: "intervention",
    label: "Intervention fit",
    question: "Is the request specific, priced and linked to the problem?",
    inputs: ["intervention.problem_description", "intervention.equipment"],
  },
  {
    id: "impact_osh",
    label: "Social, environmental & OSH",
    question: "Are wider impact and worker safety addressed?",
    inputs: [
      "intervention.social_environmental_impact",
      "intervention.osh_commitment",
    ],
  },
];

export type VariantId = "standard" | "innovation";

export interface GridVariant {
  id: VariantId;
  name: string;
  tagline: string;
  weights: Record<CriterionId, number>;
}

export const GRID_VARIANTS: Record<VariantId, GridVariant> = {
  standard: {
    id: "standard",
    name: "Standard grid",
    tagline: "Production-led businesses: growth, jobs and local inputs weigh most.",
    weights: {
      growth: 15,
      jobs: 15,
      inclusion: 15,
      uniqueness: 10,
      market: 10,
      local_inputs: 10,
      management: 10,
      intervention: 10,
      impact_osh: 5,
    },
  },
  innovation: {
    id: "innovation",
    name: "Innovation grid",
    tagline: "Service and technology businesses: a unique offer counts twice as much.",
    weights: {
      growth: 10,
      jobs: 15,
      inclusion: 15,
      uniqueness: 20,
      market: 10,
      local_inputs: 5,
      management: 10,
      intervention: 10,
      impact_osh: 5,
    },
  },
};

const INNOVATION_SECTORS: SectorCategory[] = ["services", "technology"];

export const SECTOR_LABELS: Record<SectorCategory, string> = {
  agro_processing: "Agro-processing",
  manufacturing: "Manufacturing",
  services: "Services",
  technology: "Technology",
  trade: "Trade",
  hospitality: "Hospitality",
};

export function routeVariant(pack: ApplicationPack): {
  variant: VariantId;
  reason: string;
  confirmed: boolean;
} {
  const sector = pack.context.sector_category;
  if (sector == null) {
    return {
      variant: "standard",
      reason:
        "Sector could not be matched to the list, so the standard grid is shown provisionally. A reviewer must confirm the variant.",
      confirmed: false,
    };
  }
  if (INNOVATION_SECTORS.includes(sector)) {
    return {
      variant: "innovation",
      reason: `${SECTOR_LABELS[sector]} business: routed to the innovation grid, which rewards a unique offer twice as heavily.`,
      confirmed: true,
    };
  }
  return {
    variant: "standard",
    reason: `${SECTOR_LABELS[sector]} business: routed to the standard grid.`,
    confirmed: true,
  };
}

/** The evaluation is made as of the call's assessment date, not "today". */
export const ASSESSMENT_DATE = "2026-09-30";

export const GATE_RULES = {
  minYearsInOperation: 1,
  maxEmployees: 100,
};

/** Activities that end an application on the spot (exclusion factor 1). */
export const EXCLUDED_ACTIVITIES = [
  "alcohol",
  "liquor",
  "tej",
  "areke",
  "beer",
  "tobacco",
  "cigarette",
  "khat",
  "chat trading",
  "weapons",
  "ammunition",
  "gambling",
  "betting",
];

/** Shortlist capacity used by the reviewer dashboard. */
export const SHORTLIST_SIZE = 6;
