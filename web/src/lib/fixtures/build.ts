/*
 * Helpers to write demo applications compactly. All people and businesses in
 * the fixtures are fictional. Values without explicit provenance resolve to
 * "unverified" — a fixture can only mark a field established by naming the
 * document it came from.
 */

import type {
  ApplicationData,
  ApplicationPack,
  BusinessOrganization,
  EvidenceSource,
  ExpectedResult,
  Gender,
  ImpactProtocolDraft,
  Lang,
  Persona,
  ProductUniqueness,
  Provenance,
  SectorCategory,
  VoiceNote,
} from "../types";
import { sdgLabel } from "../sdg";

export const established = (
  source: EvidenceSource,
  evidence?: string,
  note?: string,
): Provenance => ({ status: "established", source, evidence, note });

export const unverified = (
  source: EvidenceSource,
  evidence?: string,
  note?: string,
): Provenance => ({ status: "unverified", source, evidence, note });

export const missing = (note: string): Provenance => ({ status: "missing", note });

export function emptyApplication(): ApplicationData {
  return {
    applicant: {
      company_profile: {
        company_name: null,
        business_registration_number: null,
        address: null,
        mobile_number: null,
        email: null,
        form_of_business_organization: null,
        number_of_years_in_operation: null,
        type_of_business: null,
        ownership: null,
      },
      company_overview: { description: null, growth_indicators: [] },
      motivation: null,
      business_goals: null,
      market_overview: null,
      products_services: [],
      product_uniqueness: null,
      local_raw_material_percentage: null,
      management: { core_management_team: [], organogram: null },
    },
    intervention: {
      problem_description: null,
      equipment: [],
      consultants: [],
      expected_results: [],
      expected_results_explanation: null,
      job_creation_explanation: null,
      job_positions: [],
      social_environmental_impact: null,
      osh_commitment: null,
    },
    evidence: [],
  };
}

export function emptyImpact(): ImpactProtocolDraft {
  return {
    title: null,
    location: null,
    sdgs: [],
    funding_target_etb: null,
    beneficiaries: [],
    milestones: [],
    sector: null,
  };
}

/** Licence-derived fields, established from the licence photo. */
export const LICENCE_BACKED_KEYS = [
  "licence.licence_number",
  "licence.registration_date",
  "licence.valid_until",
  "licence.business_activity",
  "company_profile.company_name",
  "company_profile.business_registration_number",
  "company_profile.form_of_business_organization",
];

/** Keys drafted by BizzAgent for the applicant to approve. */
export const DRAFTED_IMPACT_KEYS = [
  "impact.title",
  "impact.location",
  "impact.sdgs",
  "impact.beneficiaries",
  "impact.milestones",
  "impact.sector",
];

export interface QuickSpec {
  id: string;
  language?: Lang;
  persona?: Persona;
  voiceNote?: VoiceNote;
  name: string;
  town: string;
  region: string;
  address: string;
  category: SectorCategory | null;
  typeOfBusiness: string;
  licence: {
    number: string | null;
    registered: string | null;
    validUntil: string | null;
    activity: string | null;
  };
  form: BusinessOrganization;
  years: number | null;
  phone: string | null;
  email: string | null;
  ownership: [women: number, men: number] | null;
  description: string;
  growth: [year: number, sales: number | null, total: number | null, women: number | null, youth: number | null][];
  motivation: string | null;
  goals: string | null;
  market: string | null;
  products: [product: string, market: string, channel: string][];
  uniqueness: ProductUniqueness | null;
  localPct: number | null;
  team: [name: string, position: string, gender: Gender][];
  organogram: string | null;
  problem: string | null;
  equipment: [description: string, quantity: number, priceEtb: number | null, purpose: string | null][];
  consultants?: [problem: string, expertise: string][];
  results: ExpectedResult[];
  resultsExplanation: string | null;
  jobs: [position: string, count: number][];
  jobsExplanation: string | null;
  social: string | null;
  osh: string | null;
  priorFunding: boolean | null;
  impact: {
    title: string;
    sdgs: number[];
    beneficiaries: string[];
    milestones: [description: string, target: string][];
    sector: string | null;
  };
  /** Default source for the applicant's own statements. */
  statedVia?: EvidenceSource;
  /** Field-specific provenance that overrides the defaults. */
  provenance?: Record<string, Provenance>;
}

export function quickPack(spec: QuickSpec): ApplicationPack {
  const data = emptyApplication();
  const profile = data.applicant.company_profile;
  profile.company_name = spec.name;
  profile.business_registration_number = spec.licence.number;
  profile.address = spec.address;
  profile.mobile_number = spec.phone;
  profile.email = spec.email;
  profile.form_of_business_organization = spec.form;
  profile.number_of_years_in_operation = spec.years;
  profile.type_of_business = spec.typeOfBusiness;
  profile.ownership = spec.ownership
    ? { women_percentage: spec.ownership[0], men_percentage: spec.ownership[1] }
    : null;

  data.applicant.company_overview = {
    description: spec.description,
    growth_indicators: spec.growth.map(([year, sales, total, women, youth]) => ({
      year,
      sales_etb: sales,
      total_employees: total,
      female_employees: women,
      youth_employees_18_24: youth,
    })),
  };
  data.applicant.motivation = spec.motivation;
  data.applicant.business_goals = spec.goals;
  data.applicant.market_overview = spec.market;
  data.applicant.products_services = spec.products.map(([product, market, channel]) => ({
    product_service: product,
    market_served: market,
    distribution_channels: channel,
  }));
  data.applicant.product_uniqueness = spec.uniqueness;
  data.applicant.local_raw_material_percentage = spec.localPct;
  data.applicant.management = {
    core_management_team: spec.team.map(([name, position, gender]) => ({ name, position, gender })),
    organogram: spec.organogram,
  };

  const iv = data.intervention;
  iv.problem_description = spec.problem;
  iv.equipment = spec.equipment.map(([description, quantity, price, purpose]) => ({
    description,
    quantity,
    estimated_total_price_etb: price,
    purpose,
  }));
  iv.consultants = (spec.consultants ?? []).map(([problem, expertise]) => ({
    problem_challenge_description: problem,
    technical_expertise_request: expertise,
  }));
  iv.expected_results = spec.results;
  iv.expected_results_explanation = spec.resultsExplanation;
  iv.job_positions = spec.jobs.map(([position, count]) => ({
    job_position: position,
    number_of_new_jobs: count,
  }));
  iv.job_creation_explanation = spec.jobsExplanation;
  iv.social_environmental_impact = spec.social;
  iv.osh_commitment = spec.osh;

  const fundingTarget = spec.equipment.reduce((sum, [, , price]) => sum + (price ?? 0), 0);

  const provenance: Record<string, Provenance> = {};
  const stated = spec.statedVia ?? "applicant_voice";
  for (const key of LICENCE_BACKED_KEYS) {
    provenance[key] = established("licence");
  }
  for (const key of DRAFTED_IMPACT_KEYS) {
    provenance[key] = unverified(
      "draft_for_approval",
      undefined,
      "Drafted by BizzAgent from the applicant's own words; the applicant must approve the wording.",
    );
  }
  provenance["impact.funding_target_etb"] = unverified(
    "system_calculation",
    `Sum of the equipment prices: ETB ${fundingTarget.toLocaleString("en-US")}.`,
    "Calculated from prices the applicant stated; no supplier quote yet.",
  );
  // Everything else defaults to "unverified" via resolveFields; record the
  // channel it came through so the pack can say so.
  for (const key of [
    "company_profile.address",
    "company_profile.mobile_number",
    "company_profile.email",
    "company_profile.number_of_years_in_operation",
    "company_profile.type_of_business",
    "company_profile.ownership",
    "company_overview.description",
    "company_overview.growth_indicators",
    "motivation",
    "business_goals",
    "market_overview",
    "products_services",
    "product_uniqueness",
    "local_raw_material_percentage",
    "management.core_management_team",
    "management.organogram",
    "intervention.problem_description",
    "intervention.equipment",
    "intervention.consultants",
    "intervention.expected_results",
    "intervention.expected_results_explanation",
    "intervention.job_positions",
    "intervention.job_creation_explanation",
    "intervention.social_environmental_impact",
    "intervention.osh_commitment",
  ]) {
    provenance[key] = unverified(stated);
  }
  Object.assign(provenance, spec.provenance ?? {});

  return {
    id: spec.id,
    kind: "demo",
    language: spec.language ?? "en",
    persona: spec.persona,
    voiceNote: spec.voiceNote,
    data,
    licence: {
      licence_number: spec.licence.number,
      registration_date: spec.licence.registered,
      valid_until: spec.licence.validUntil,
      business_activity: spec.licence.activity,
    },
    documents: { licence_photo: true, workshop_photo: true },
    context: {
      region: spec.region,
      town: spec.town,
      sector_category: spec.category,
      prior_funding_same_intervention: spec.priorFunding,
    },
    impact: {
      title: spec.impact.title,
      location: `${spec.town}, ${spec.region}`,
      sdgs: spec.impact.sdgs.map(sdgLabel),
      funding_target_etb: fundingTarget || null,
      beneficiaries: spec.impact.beneficiaries,
      milestones: spec.impact.milestones.map(([description, target]) => ({ description, target })),
      sector: spec.impact.sector,
    },
    provenance,
  };
}
