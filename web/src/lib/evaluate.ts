/*
 * Deterministic evaluation: eligibility gate, exclusion factors and the
 * weighted grid. No language model is involved. A criterion whose inputs are
 * missing is not scored; one whose inputs contradict each other is held. The
 * rules mirror what should later live in backend/app/rules.py.
 */

import { yearsBetween, type Contradiction } from "./contradictions";
import { formatETB } from "./format";
import {
  ASSESSMENT_DATE,
  CRITERIA,
  EXCLUDED_ACTIVITIES,
  GATE_RULES,
  GRID_VARIANTS,
  routeVariant,
  type CriterionId,
  type VariantId,
} from "./grid";
import type { ResolvedFields } from "./resolve";
import {
  PRODUCT_UNIQUENESS,
  type ApplicationPack,
  type FieldStatus,
  type GrowthIndicator,
} from "./types";

export type CheckOutcome = "pass" | "fail" | "unknown";

export interface CheckResult {
  id: string;
  label: string;
  outcome: CheckOutcome;
  detail: string;
  question?: string;
}

/** What a pending check still has to establish. */
const CHECK_SUBJECTS: Record<string, string> = {
  licence: "the licence details",
  ethiopia: "the business location",
  years: "the years in operation",
  size: "the number of employees",
  excluded_activity: "the business activity",
  licence_validity: "the licence validity",
  double_funding: "whether another funder pays for the same intervention",
};

export type CriterionState = "scored" | "provisional" | "held" | "not_scored";

export interface CriterionResult {
  id: CriterionId;
  label: string;
  question: string;
  weight: number;
  rating: number | null;
  points: number | null;
  state: CriterionState;
  basis: FieldStatus;
  reasoning: string;
}

export type Eligibility = "eligible" | "pending" | "excluded";

export interface Evaluation {
  variant: VariantId;
  variantReason: string;
  variantConfirmed: boolean;
  gate: CheckResult[];
  exclusions: CheckResult[];
  eligibility: Eligibility;
  eligibilityReason: string;
  criteria: CriterionResult[];
  total: number;
  provisionalPoints: number;
  unscoredPoints: number;
  otherVariant: { id: VariantId; total: number };
  siteVisitQuestions: string[];
  justification: string;
  assessedAsOf: string;
}

// ---------------------------------------------------------------------------
// Ratings (0..1) per criterion
// ---------------------------------------------------------------------------

interface Rating {
  rating: number | null;
  reasoning: string;
}

const round1 = (value: number) => Math.round(value * 10) / 10;
const pct = (value: number) => `${Math.round(value * 100)}%`;

function latestStaffRow(rows: GrowthIndicator[]): GrowthIndicator | undefined {
  return [...rows]
    .filter((row) => row.total_employees != null && row.total_employees > 0)
    .sort((a, b) => b.year - a.year)[0];
}

function rateGrowth(pack: ApplicationPack): Rating {
  const rows = pack.data.applicant.company_overview.growth_indicators
    .filter((row) => row.sales_etb != null && row.sales_etb > 0)
    .sort((a, b) => a.year - b.year);
  if (rows.length < 2) {
    return { rating: null, reasoning: "Fewer than two years of sales on record, so growth cannot be measured." };
  }
  const first = rows[0];
  const last = rows[rows.length - 1];
  const span = Math.max(1, last.year - first.year);
  const cagr = Math.pow((last.sales_etb as number) / (first.sales_etb as number), 1 / span) - 1;
  const rating =
    cagr >= 0.25 ? 1 : cagr >= 0.15 ? 0.8 : cagr >= 0.05 ? 0.55 : cagr >= 0 ? 0.3 : 0.1;
  const sign = cagr >= 0 ? "+" : "−";
  const coverage = rows.length < 5 ? ` Only ${rows.length} of 5 years on record.` : "";
  return {
    rating,
    reasoning: `Sales went from ${formatETB(first.sales_etb)} in ${first.year} to ${formatETB(last.sales_etb)} in ${last.year} (${sign}${Math.abs(Math.round(cagr * 100))}% a year).${coverage}`,
  };
}

function rateJobs(pack: ApplicationPack): Rating {
  const positions = pack.data.intervention.job_positions;
  const counted = positions.filter((p) => p.number_of_new_jobs != null);
  if (counted.length === 0) {
    return { rating: null, reasoning: "No number of new jobs given." };
  }
  const total = counted.reduce((sum, p) => sum + (p.number_of_new_jobs ?? 0), 0);
  const rating = total >= 6 ? 1 : total >= 4 ? 0.8 : total >= 2 ? 0.55 : total >= 1 ? 0.3 : 0;
  const roles = counted
    .map((p) => `${p.number_of_new_jobs} ${p.job_position?.toLowerCase() ?? "role"}`)
    .join(", ");
  return { rating, reasoning: `${total} new job${total === 1 ? "" : "s"} planned: ${roles}.` };
}

function rateInclusion(pack: ApplicationPack): Rating {
  const row = latestStaffRow(pack.data.applicant.company_overview.growth_indicators);
  if (!row || row.female_employees == null || row.youth_employees_18_24 == null) {
    return { rating: null, reasoning: "Staff split by gender and age is not on record." };
  }
  const total = row.total_employees as number;
  const women = row.female_employees / total;
  const youth = row.youth_employees_18_24 / total;
  // Ownership only counts when it adds up; a contradictory split earns nothing.
  const ownership = pack.data.applicant.company_profile.ownership;
  const ownershipConsistent =
    ownership != null &&
    Math.abs(ownership.women_percentage + ownership.men_percentage - 100) <= 0.5;
  const womenLed = ownershipConsistent && ownership.women_percentage >= 50;
  const rating = Math.min(
    1,
    0.6 * Math.min(women / 0.5, 1) + 0.4 * Math.min(youth / 0.3, 1) + (womenLed ? 0.1 : 0),
  );
  return {
    rating,
    reasoning: `In ${row.year}, ${row.female_employees} of ${total} employees were women (${pct(women)}) and ${row.youth_employees_18_24} were aged 18–24 (${pct(youth)}).${womenLed ? " Majority women-owned." : ""}`,
  };
}

function rateUniqueness(pack: ApplicationPack): Rating {
  const value = pack.data.applicant.product_uniqueness;
  if (value == null) return { rating: null, reasoning: "Uniqueness not stated." };
  const rating =
    value === PRODUCT_UNIQUENESS.NEW_IN_ETHIOPIA
      ? 1
      : value === PRODUCT_UNIQUENESS.DIFFERENT_FROM_COMPETITORS
        ? 0.6
        : 0.15;
  return { rating, reasoning: `Declared as “${value}”.` };
}

function rateMarket(pack: ApplicationPack): Rating {
  const markets = new Set(
    pack.data.applicant.products_services
      .map((p) => p.market_served?.trim().toLowerCase())
      .filter((m): m is string => Boolean(m)),
  );
  if (markets.size === 0) return { rating: null, reasoning: "No market served is named." };
  const rating = markets.size >= 3 ? 1 : markets.size === 2 ? 0.75 : 0.5;
  return {
    rating,
    reasoning: `Serves ${markets.size} distinct market${markets.size === 1 ? "" : "s"}: ${pack.data.applicant.products_services
      .map((p) => p.market_served)
      .filter(Boolean)
      .join("; ")}.`,
  };
}

function rateLocalInputs(pack: ApplicationPack): Rating {
  const value = pack.data.applicant.local_raw_material_percentage;
  if (value == null) return { rating: null, reasoning: "Share of local inputs not stated." };
  return { rating: value / 100, reasoning: `${value}% of raw materials are sourced in Ethiopia.` };
}

function rateManagement(pack: ApplicationPack): Rating {
  const { core_management_team: team, organogram } = pack.data.applicant.management;
  const named = team.filter((m) => m.name);
  if (named.length === 0) return { rating: null, reasoning: "No core team named." };
  const women = named.filter((m) => m.gender === "Female").length;
  const rating = (Math.min(named.length, 3) / 3) * 0.7 + (organogram ? 0.3 : 0);
  return {
    rating,
    reasoning: `${named.length} ${named.length === 1 ? "person" : "people"} in the core team${women ? `, ${women} of them women` : ""}; ${organogram ? "organogram provided" : "no organogram yet, which lowers this score"}.`,
  };
}

function rateIntervention(pack: ApplicationPack): Rating {
  const iv = pack.data.intervention;
  if (!iv.problem_description || iv.equipment.length === 0) {
    return { rating: null, reasoning: "Problem or requested equipment is missing." };
  }
  const complete = iv.equipment.filter(
    (e) => e.estimated_total_price_etb != null && e.purpose,
  ).length;
  const share = complete / iv.equipment.length;
  const rating = 0.3 + 0.4 * share + (iv.expected_results_explanation ? 0.3 : 0);
  const total = iv.equipment.reduce((sum, e) => sum + (e.estimated_total_price_etb ?? 0), 0);
  return {
    rating,
    reasoning: `Problem is stated; ${complete} of ${iv.equipment.length} items are priced with a purpose (total ${formatETB(total)}); ${iv.expected_results_explanation ? "results are explained" : "results are not explained"}.`,
  };
}

function rateImpactOsh(pack: ApplicationPack): Rating {
  const iv = pack.data.intervention;
  if (!iv.social_environmental_impact || !iv.osh_commitment) {
    return { rating: null, reasoning: "Impact or OSH commitment is missing." };
  }
  return { rating: 1, reasoning: "Social and environmental impact and a worker-safety commitment are both described." };
}

const RATERS: Record<CriterionId, (pack: ApplicationPack) => Rating> = {
  growth: rateGrowth,
  jobs: rateJobs,
  inclusion: rateInclusion,
  uniqueness: rateUniqueness,
  market: rateMarket,
  local_inputs: rateLocalInputs,
  management: rateManagement,
  intervention: rateIntervention,
  impact_osh: rateImpactOsh,
};

const VERIFY_PROMPTS: Record<CriterionId, string> = {
  growth: "Ask to see the sales book or tax receipts behind the yearly sales figures.",
  jobs: "Confirm the hiring plan: which roles, when, and at what wage.",
  inclusion: "Count staff on site and check the payroll for women and 18–24 year-olds.",
  uniqueness: "Compare the product with two competitors in the same market.",
  market: "Ask for recent invoices or delivery notes from each market served.",
  local_inputs: "Check supplier receipts for locally sourced inputs.",
  management: "Meet the core team and confirm who does what.",
  intervention: "Ask for a supplier pro-forma invoice for each item requested.",
  impact_osh: "Walk the workshop floor: ventilation, protective gear, first aid.",
};

const STATUS_WEIGHT: Record<FieldStatus, number> = {
  established: 0,
  unverified: 1,
  contradictory: 2,
  missing: 3,
};

// ---------------------------------------------------------------------------
// Gate and exclusions
// ---------------------------------------------------------------------------

/** "Town, Region", without repeating a city that is also its region. */
export function placeName(pack: ApplicationPack): string {
  const { town, region } = pack.context;
  return [...new Set([town, region].filter(Boolean))].join(", ");
}

function gateChecks(pack: ApplicationPack, fields: ResolvedFields): CheckResult[] {
  const profile = pack.data.applicant.company_profile;
  const licenceKnown =
    fields["licence.licence_number"]?.status !== "missing" ||
    fields["licence.registration_date"]?.status !== "missing";

  const licence: CheckResult = licenceKnown
    ? { id: "licence", label: "Business licence provided", outcome: "pass", detail: "Licence details read from the photo." }
    : pack.documents?.licence_photo
      ? {
          id: "licence",
          label: "Business licence provided",
          outcome: "unknown",
          detail: "A licence photo passed the automated document check, but its details are not read yet.",
          question: "Read the licence number and dates from the original paper licence.",
        }
      : {
          id: "licence",
          label: "Business licence provided",
          outcome: "unknown",
          detail: "No licence details on record.",
          question: "Ask the applicant for the paper licence.",
        };

  const hasLocation = Boolean(pack.context.region || pack.context.town || profile.address);
  const location: CheckResult = hasLocation
    ? {
        id: "ethiopia",
        label: "Operates in Ethiopia",
        outcome: "pass",
        detail: placeName(pack) || (profile.address as string),
      }
    : {
        id: "ethiopia",
        label: "Operates in Ethiopia",
        outcome: "unknown",
        detail: "Location not established.",
        question: "Confirm where the workshop is located.",
      };

  let years: CheckResult;
  // A claim that contradicts the licence is not used; the licence date is.
  const claimed =
    fields["company_profile.number_of_years_in_operation"]?.status === "contradictory"
      ? null
      : profile.number_of_years_in_operation;
  const regDate = pack.licence.registration_date;
  if (claimed != null) {
    years =
      claimed >= GATE_RULES.minYearsInOperation
        ? { id: "years", label: `At least ${GATE_RULES.minYearsInOperation} year in operation`, outcome: "pass", detail: `${claimed} years stated.` }
        : { id: "years", label: `At least ${GATE_RULES.minYearsInOperation} year in operation`, outcome: "fail", detail: `Only ${claimed} years stated.` };
  } else if (regDate) {
    const fromLicence = yearsBetween(regDate, ASSESSMENT_DATE);
    years =
      fromLicence >= GATE_RULES.minYearsInOperation
        ? { id: "years", label: `At least ${GATE_RULES.minYearsInOperation} year in operation`, outcome: "pass", detail: "Based on the licence registration date." }
        : { id: "years", label: `At least ${GATE_RULES.minYearsInOperation} year in operation`, outcome: "fail", detail: "Licence registered less than a year ago." };
  } else {
    years = {
      id: "years",
      label: `At least ${GATE_RULES.minYearsInOperation} year in operation`,
      outcome: "unknown",
      detail: "Neither the years in operation nor the licence date are known.",
      question: "When did the business start trading? Ask for the oldest receipt or licence.",
    };
  }

  const staffRow = latestStaffRow(pack.data.applicant.company_overview.growth_indicators);
  const size: CheckResult = staffRow
    ? (staffRow.total_employees as number) <= GATE_RULES.maxEmployees
      ? { id: "size", label: `Micro, small or medium (≤ ${GATE_RULES.maxEmployees} staff)`, outcome: "pass", detail: `${staffRow.total_employees} employees in ${staffRow.year}.` }
      : { id: "size", label: `Micro, small or medium (≤ ${GATE_RULES.maxEmployees} staff)`, outcome: "fail", detail: `${staffRow.total_employees} employees in ${staffRow.year}.` }
    : {
        id: "size",
        label: `Micro, small or medium (≤ ${GATE_RULES.maxEmployees} staff)`,
        outcome: "unknown",
        detail: "Number of employees not on record.",
        question: "How many people work in the business today?",
      };

  return [licence, location, years, size];
}

function exclusionChecks(pack: ApplicationPack): CheckResult[] {
  const applicant = pack.data.applicant;
  const text = [
    applicant.company_profile.type_of_business,
    pack.licence.business_activity,
    applicant.company_overview.description,
    ...applicant.products_services.map((p) => p.product_service),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let activity: CheckResult;
  if (!text) {
    activity = {
      id: "excluded_activity",
      label: "Excluded activity (alcohol, tobacco, khat, arms, gambling)",
      outcome: "unknown",
      detail: "Business activity not established.",
      question: "What exactly does the business make or sell?",
    };
  } else {
    const hit = EXCLUDED_ACTIVITIES.find((word) =>
      new RegExp(`\\b${word}\\b`).test(text),
    );
    activity = hit
      ? {
          id: "excluded_activity",
          label: "Excluded activity (alcohol, tobacco, khat, arms, gambling)",
          outcome: "fail",
          detail: `Business activity includes “${hit}”, which is on the exclusion list.`,
        }
      : {
          id: "excluded_activity",
          label: "Excluded activity (alcohol, tobacco, khat, arms, gambling)",
          outcome: "pass",
          detail: "No excluded activity in the licence or the applicant's description.",
        };
  }

  const validUntil = pack.licence.valid_until;
  const licence: CheckResult = !validUntil
    ? {
        id: "licence_validity",
        label: "Licence expired or invalid",
        outcome: "unknown",
        detail: "Licence validity date not read.",
        question: "Check the renewal stamp on the paper licence.",
      }
    : validUntil < ASSESSMENT_DATE
      ? {
          id: "licence_validity",
          label: "Licence expired or invalid",
          outcome: "fail",
          detail: `Licence expired on ${validUntil}, before the assessment date ${ASSESSMENT_DATE}.`,
        }
      : {
          id: "licence_validity",
          label: "Licence expired or invalid",
          outcome: "pass",
          detail: `Valid until ${validUntil}.`,
        };

  const prior = pack.context.prior_funding_same_intervention;
  const funding: CheckResult =
    prior == null
      ? {
          id: "double_funding",
          label: "Same intervention funded elsewhere",
          outcome: "unknown",
          detail: "The applicant has not been asked yet.",
          question: "Is any other donor, bank or programme paying for the same equipment or service?",
        }
      : prior
        ? {
            id: "double_funding",
            label: "Same intervention funded elsewhere",
            outcome: "fail",
            detail: "The applicant stated another programme already funds this intervention.",
          }
        : {
            id: "double_funding",
            label: "Same intervention funded elsewhere",
            outcome: "pass",
            detail: "The applicant stated no other funding; to be confirmed in the declaration.",
          };

  return [activity, licence, funding];
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

function totalFor(criteria: CriterionResult[], variant: VariantId): number {
  const weights = GRID_VARIANTS[variant].weights;
  return round1(
    criteria.reduce(
      (sum, c) => sum + (c.rating != null && c.state !== "held" ? c.rating * weights[c.id] : 0),
      0,
    ),
  );
}

export function evaluate(
  pack: ApplicationPack,
  fields: ResolvedFields,
  contradictions: Contradiction[],
): Evaluation {
  const route = routeVariant(pack);
  const weights = GRID_VARIANTS[route.variant].weights;
  const other: VariantId = route.variant === "standard" ? "innovation" : "standard";

  const criteria: CriterionResult[] = CRITERIA.map((criterion) => {
    const statuses = criterion.inputs.map((key) => fields[key]?.status ?? "missing");
    const basis = statuses.reduce<FieldStatus>(
      (worst, s) => (STATUS_WEIGHT[s] > STATUS_WEIGHT[worst] ? s : worst),
      "established",
    );
    const weight = weights[criterion.id];
    const base = { id: criterion.id, label: criterion.label, question: criterion.question, weight, basis };

    if (basis === "missing") {
      const missingLabels = criterion.inputs
        .filter((key) => fields[key]?.status === "missing")
        .map((key) => fields[key]?.field.label.toLowerCase());
      return {
        ...base,
        rating: null,
        points: null,
        state: "not_scored" as const,
        reasoning: `Not scored: ${missingLabels.join(" and ")} ${missingLabels.length > 1 ? "are" : "is"} missing. Nothing is guessed.`,
      };
    }

    const { rating, reasoning } = RATERS[criterion.id](pack);
    if (basis === "contradictory") {
      return {
        ...base,
        rating,
        points: null,
        state: "held" as const,
        reasoning: `Held until the contradiction is explained. ${reasoning}`,
      };
    }
    if (rating == null) {
      return { ...base, rating: null, points: null, state: "not_scored" as const, reasoning };
    }
    return {
      ...base,
      rating,
      points: round1(rating * weight),
      state: basis === "unverified" ? ("provisional" as const) : ("scored" as const),
      reasoning,
    };
  });

  const gate = gateChecks(pack, fields);
  const exclusions = exclusionChecks(pack);
  const failed = [...gate, ...exclusions].filter((c) => c.outcome === "fail");
  const unknown = [...gate, ...exclusions].filter((c) => c.outcome === "unknown");

  const eligibility: Eligibility =
    failed.length > 0 ? "excluded" : unknown.length > 0 ? "pending" : "eligible";
  const eligibilityReason =
    eligibility === "excluded"
      ? failed.map((c) => c.detail).join(" ")
      : eligibility === "pending"
        ? `Eligibility is pending until the site visit confirms ${unknown.map((c) => CHECK_SUBJECTS[c.id] ?? c.label.toLowerCase()).join(" and ")}.`
        : "Passes the eligibility gate and no exclusion factor applies.";

  const total = totalFor(criteria, route.variant);
  const provisionalPoints = round1(
    criteria.filter((c) => c.state === "provisional").reduce((sum, c) => sum + (c.points ?? 0), 0),
  );
  const unscoredPoints = criteria
    .filter((c) => c.state === "not_scored" || c.state === "held")
    .reduce((sum, c) => sum + c.weight, 0);

  const questions = new Set<string>();
  for (const check of [...exclusions, ...gate]) {
    if (check.outcome === "unknown" && check.question) questions.add(check.question);
  }
  for (const c of contradictions) questions.add(c.question);
  for (const c of criteria) {
    if (c.state === "provisional" && c.weight >= 10) questions.add(VERIFY_PROMPTS[c.id]);
  }

  const evaluation: Evaluation = {
    variant: route.variant,
    variantReason: route.reason,
    variantConfirmed: route.confirmed,
    gate,
    exclusions,
    eligibility,
    eligibilityReason,
    criteria,
    total,
    provisionalPoints,
    unscoredPoints,
    otherVariant: { id: other, total: totalFor(criteria, other) },
    siteVisitQuestions: [...questions],
    justification: "",
    assessedAsOf: ASSESSMENT_DATE,
  };
  evaluation.justification = justify(pack, evaluation, contradictions);
  return evaluation;
}

function justify(
  pack: ApplicationPack,
  evaluation: Evaluation,
  contradictions: Contradiction[],
): string {
  const name = pack.data.applicant.company_profile.company_name ?? "This applicant";
  const place = pack.context.town ? ` (${pack.context.town})` : "";

  if (evaluation.eligibility === "excluded") {
    return `${name}${place} is excluded: ${evaluation.eligibilityReason} The grid score of ${Math.round(evaluation.total)} is shown for transparency only and does not enter the ranking.`;
  }

  const variant = GRID_VARIANTS[evaluation.variant].name.toLowerCase();
  const otherName = GRID_VARIANTS[evaluation.otherVariant.id].name.toLowerCase();
  const scored = evaluation.criteria
    .filter((c) => c.rating != null && c.state !== "held")
    .sort((a, b) => (b.rating ?? 0) * b.weight - (a.rating ?? 0) * a.weight);
  const strongest = scored.slice(0, 2).map((c) => c.label.toLowerCase());
  const weakest = [...scored].sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))[0];

  const parts = [
    `${name}${place} scores ${Math.round(evaluation.total)}/100 on the ${variant}${evaluation.variantConfirmed ? "" : " (routing provisional)"} and would score ${Math.round(evaluation.otherVariant.total)} on the ${otherName}.`,
  ];
  if (strongest.length) {
    parts.push(
      `Strongest on ${strongest.join(" and ")}${weakest ? `; weakest on ${weakest.label.toLowerCase()}` : ""}.`,
    );
  }
  const caveats: string[] = [];
  if (evaluation.provisionalPoints > 0) {
    caveats.push(`${Math.round(evaluation.provisionalPoints)} points rest on the applicant's word`);
  }
  if (contradictions.length) {
    caveats.push(
      `${contradictions.length} contradiction${contradictions.length === 1 ? "" : "s"} must be explained on site`,
    );
  }
  if (evaluation.unscoredPoints > 0) {
    caveats.push(`${evaluation.unscoredPoints} points could not be scored for missing evidence`);
  }
  if (caveats.length) {
    const sentence = caveats.join(", ");
    parts.push(`${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`);
  }
  if (evaluation.eligibility === "pending") parts.push(evaluation.eligibilityReason);
  return parts.join(" ");
}
