/*
 * Registry of the application form, sections 1.1 to 2.6.
 *
 * One place describes every field: where it lives, how it renders, whether
 * it is required, what evidence would establish it and who can provide it.
 * The pack view, the gap list and the evaluator all read from here.
 *
 * The section split mirrors backend/app/schemas (company.py, intervention.py).
 * Reconcile labels and numbering against the official sequa form before use.
 */

import type { ApplicationPack } from "./types";

export type SectionId =
  | "licence"
  | "1.1"
  | "1.2"
  | "1.3"
  | "1.4"
  | "1.5"
  | "1.6"
  | "2.1"
  | "2.2"
  | "2.3"
  | "2.4"
  | "2.5"
  | "2.6"
  | "impact";

export interface FormSection {
  id: SectionId;
  part: "evidence" | "applicant" | "intervention" | "impact";
  title: string;
  summary: string;
}

export const SECTIONS: FormSection[] = [
  {
    id: "licence",
    part: "evidence",
    title: "Business licence",
    summary: "Read from the photo of the paper licence.",
  },
  {
    id: "1.1",
    part: "applicant",
    title: "Company profile",
    summary: "Who the business is, where it is and who owns it.",
  },
  {
    id: "1.2",
    part: "applicant",
    title: "Company overview & growth",
    summary: "What it does, and five years of sales and jobs by gender and age.",
  },
  {
    id: "1.3",
    part: "applicant",
    title: "Motivation & goals",
    summary: "Why the applicant is applying and where they want to go.",
  },
  {
    id: "1.4",
    part: "applicant",
    title: "Market & products",
    summary: "What is sold, to whom, and through which channels.",
  },
  {
    id: "1.5",
    part: "applicant",
    title: "Uniqueness & local inputs",
    summary: "What sets the offer apart and how much is sourced locally.",
  },
  {
    id: "1.6",
    part: "applicant",
    title: "Management",
    summary: "The core team and how the business is organised.",
  },
  {
    id: "2.1",
    part: "intervention",
    title: "Problem to solve",
    summary: "The business problem the funding should solve.",
  },
  {
    id: "2.2",
    part: "intervention",
    title: "Equipment requested",
    summary: "Machinery or tools, quantities, prices and purpose.",
  },
  {
    id: "2.3",
    part: "intervention",
    title: "Consultants requested",
    summary: "Technical expertise needed, if any.",
  },
  {
    id: "2.4",
    part: "intervention",
    title: "Expected results",
    summary: "What the intervention should change for the business.",
  },
  {
    id: "2.5",
    part: "intervention",
    title: "Job creation",
    summary: "New positions the intervention is expected to create.",
  },
  {
    id: "2.6",
    part: "intervention",
    title: "Social, environmental & OSH",
    summary: "Wider impact and occupational safety and health commitment.",
  },
  {
    id: "impact",
    part: "impact",
    title: "ImpactProtocol draft",
    summary: "The project page drafted for ImpactProtocol.",
  },
];

export type Provider =
  | "Applicant"
  | "Licence photo"
  | "Bookkeeper or accountant"
  | "Supplier quote"
  | "Field officer (site visit)"
  | "Programme team";

export type FieldKind =
  | "text"
  | "longtext"
  | "number"
  | "money"
  | "percent"
  | "date"
  | "ownership"
  | "growth"
  | "products"
  | "team"
  | "equipment"
  | "consultants"
  | "results"
  | "jobs"
  | "list"
  | "sdgs"
  | "milestones";

export interface FormField {
  key: string;
  section: SectionId;
  label: string;
  kind: FieldKind;
  required: boolean;
  /** What evidence would establish this field. */
  needs: string;
  /** Who can provide that evidence. */
  provider: Provider;
  get: (pack: ApplicationPack) => unknown;
}

const profile = (p: ApplicationPack) => p.data.applicant.company_profile;
const applicant = (p: ApplicationPack) => p.data.applicant;
const intervention = (p: ApplicationPack) => p.data.intervention;

export const FORM_FIELDS: FormField[] = [
  // Licence ---------------------------------------------------------------
  {
    key: "licence.licence_number",
    section: "licence",
    label: "Licence number",
    kind: "text",
    required: true,
    needs: "A readable photo of the licence showing its number.",
    provider: "Licence photo",
    get: (p) => p.licence.licence_number,
  },
  {
    key: "licence.registration_date",
    section: "licence",
    label: "Registration date",
    kind: "date",
    required: true,
    needs: "The registration date printed on the licence.",
    provider: "Licence photo",
    get: (p) => p.licence.registration_date,
  },
  {
    key: "licence.valid_until",
    section: "licence",
    label: "Valid until",
    kind: "date",
    required: true,
    needs: "The validity or renewal date on the licence.",
    provider: "Licence photo",
    get: (p) => p.licence.valid_until,
  },
  {
    key: "licence.business_activity",
    section: "licence",
    label: "Licensed business activity",
    kind: "text",
    required: true,
    needs: "The business activity line on the licence.",
    provider: "Licence photo",
    get: (p) => p.licence.business_activity,
  },

  // 1.1 Company profile ---------------------------------------------------
  {
    key: "company_profile.company_name",
    section: "1.1",
    label: "Company name",
    kind: "text",
    required: true,
    needs: "The registered name as written on the licence.",
    provider: "Licence photo",
    get: (p) => profile(p).company_name,
  },
  {
    key: "company_profile.business_registration_number",
    section: "1.1",
    label: "Business registration number",
    kind: "text",
    required: true,
    needs: "The registration number on the licence.",
    provider: "Licence photo",
    get: (p) => profile(p).business_registration_number,
  },
  {
    key: "company_profile.address",
    section: "1.1",
    label: "Address",
    kind: "text",
    required: true,
    needs: "Town, woreda or sub-city, and region of the workshop.",
    provider: "Applicant",
    get: (p) => profile(p).address,
  },
  {
    key: "company_profile.mobile_number",
    section: "1.1",
    label: "Mobile number",
    kind: "text",
    required: true,
    needs: "A phone number the programme can reach the owner on.",
    provider: "Applicant",
    get: (p) => profile(p).mobile_number,
  },
  {
    key: "company_profile.email",
    section: "1.1",
    label: "Email",
    kind: "text",
    required: true,
    needs: "Any email the applicant can read, or a family member's with consent.",
    provider: "Applicant",
    get: (p) => profile(p).email,
  },
  {
    key: "company_profile.form_of_business_organization",
    section: "1.1",
    label: "Form of business organisation",
    kind: "text",
    required: true,
    needs: "The legal form shown on the licence.",
    provider: "Licence photo",
    get: (p) => profile(p).form_of_business_organization,
  },
  {
    key: "company_profile.number_of_years_in_operation",
    section: "1.1",
    label: "Years in operation",
    kind: "number",
    required: true,
    needs: "When the business started, ideally backed by the licence date.",
    provider: "Applicant",
    get: (p) => profile(p).number_of_years_in_operation,
  },
  {
    key: "company_profile.type_of_business",
    section: "1.1",
    label: "Type of business",
    kind: "text",
    required: true,
    needs: "What the business does, matching the licensed activity.",
    provider: "Applicant",
    get: (p) => profile(p).type_of_business,
  },
  {
    key: "company_profile.ownership",
    section: "1.1",
    label: "Ownership by gender",
    kind: "ownership",
    required: true,
    needs: "Share of ownership held by women and men, adding up to 100%.",
    provider: "Applicant",
    get: (p) => profile(p).ownership,
  },

  // 1.2 Overview & growth ------------------------------------------------
  {
    key: "company_overview.description",
    section: "1.2",
    label: "Business description",
    kind: "longtext",
    required: true,
    needs: "A short description of what the business does, in the owner's words.",
    provider: "Applicant",
    get: (p) => applicant(p).company_overview.description,
  },
  {
    key: "company_overview.growth_indicators",
    section: "1.2",
    label: "Sales & employment, last five years",
    kind: "growth",
    required: true,
    needs: "Yearly sales and staff counts by gender and age, from a sales book or tax returns.",
    provider: "Bookkeeper or accountant",
    get: (p) => applicant(p).company_overview.growth_indicators,
  },

  // 1.3 Motivation --------------------------------------------------------
  {
    key: "motivation",
    section: "1.3",
    label: "Motivation for applying",
    kind: "longtext",
    required: true,
    needs: "Why the applicant wants this support now.",
    provider: "Applicant",
    get: (p) => applicant(p).motivation,
  },
  {
    key: "business_goals",
    section: "1.3",
    label: "Business goals",
    kind: "longtext",
    required: true,
    needs: "Where the owner wants the business to be in two to three years.",
    provider: "Applicant",
    get: (p) => applicant(p).business_goals,
  },

  // 1.4 Market & products -------------------------------------------------
  {
    key: "market_overview",
    section: "1.4",
    label: "Market overview",
    kind: "longtext",
    required: true,
    needs: "Who buys, how many customers, and what competitors exist.",
    provider: "Applicant",
    get: (p) => applicant(p).market_overview,
  },
  {
    key: "products_services",
    section: "1.4",
    label: "Products & services",
    kind: "products",
    required: true,
    needs: "Each product or service with its market and distribution channel.",
    provider: "Applicant",
    get: (p) => applicant(p).products_services,
  },

  // 1.5 Uniqueness & inputs -----------------------------------------------
  {
    key: "product_uniqueness",
    section: "1.5",
    label: "Product uniqueness",
    kind: "text",
    required: true,
    needs: "What makes the offer different, ideally confirmed by customers or a site visit.",
    provider: "Applicant",
    get: (p) => applicant(p).product_uniqueness,
  },
  {
    key: "local_raw_material_percentage",
    section: "1.5",
    label: "Local raw materials",
    kind: "percent",
    required: true,
    needs: "Share of inputs bought in Ethiopia, from supplier receipts.",
    provider: "Applicant",
    get: (p) => applicant(p).local_raw_material_percentage,
  },

  // 1.6 Management ----------------------------------------------------------
  {
    key: "management.core_management_team",
    section: "1.6",
    label: "Core management team",
    kind: "team",
    required: true,
    needs: "Name, role and gender of each person who runs the business.",
    provider: "Applicant",
    get: (p) => applicant(p).management.core_management_team,
  },
  {
    key: "management.organogram",
    section: "1.6",
    label: "Organogram",
    kind: "longtext",
    required: true,
    needs: "Who reports to whom. FundFlow can draft it from the team list for the owner to confirm.",
    provider: "Applicant",
    get: (p) => applicant(p).management.organogram,
  },

  // 2.1 Problem -------------------------------------------------------------
  {
    key: "intervention.problem_description",
    section: "2.1",
    label: "Problem description",
    kind: "longtext",
    required: true,
    needs: "The specific problem that holds the business back.",
    provider: "Applicant",
    get: (p) => intervention(p).problem_description,
  },

  // 2.2 Equipment -----------------------------------------------------------
  {
    key: "intervention.equipment",
    section: "2.2",
    label: "Machinery & equipment",
    kind: "equipment",
    required: true,
    needs: "Item, quantity and price from a supplier pro-forma invoice.",
    provider: "Supplier quote",
    get: (p) => intervention(p).equipment,
  },

  // 2.3 Consultants ---------------------------------------------------------
  {
    key: "intervention.consultants",
    section: "2.3",
    label: "Consultant support",
    kind: "consultants",
    required: false,
    needs: "The challenge and the expertise needed, only if the applicant wants advice.",
    provider: "Applicant",
    get: (p) => intervention(p).consultants,
  },

  // 2.4 Expected results ----------------------------------------------------
  {
    key: "intervention.expected_results",
    section: "2.4",
    label: "Expected results",
    kind: "results",
    required: true,
    needs: "Which results the applicant expects, consistent with the equipment requested.",
    provider: "Applicant",
    get: (p) => intervention(p).expected_results,
  },
  {
    key: "intervention.expected_results_explanation",
    section: "2.4",
    label: "How the results will be reached",
    kind: "longtext",
    required: true,
    needs: "A short explanation linking the equipment to the expected results.",
    provider: "Applicant",
    get: (p) => intervention(p).expected_results_explanation,
  },

  // 2.5 Jobs ------------------------------------------------------------------
  {
    key: "intervention.job_positions",
    section: "2.5",
    label: "New job positions",
    kind: "jobs",
    required: true,
    needs: "Each new role and how many people will be hired.",
    provider: "Applicant",
    get: (p) => intervention(p).job_positions,
  },
  {
    key: "intervention.job_creation_explanation",
    section: "2.5",
    label: "Job creation explanation",
    kind: "longtext",
    required: true,
    needs: "When and why the new people will be hired.",
    provider: "Applicant",
    get: (p) => intervention(p).job_creation_explanation,
  },

  // 2.6 Impact & OSH --------------------------------------------------------
  {
    key: "intervention.social_environmental_impact",
    section: "2.6",
    label: "Social & environmental impact",
    kind: "longtext",
    required: true,
    needs: "Effects on workers, community and environment.",
    provider: "Applicant",
    get: (p) => intervention(p).social_environmental_impact,
  },
  {
    key: "intervention.osh_commitment",
    section: "2.6",
    label: "Occupational safety & health commitment",
    kind: "longtext",
    required: true,
    needs: "What the owner does, or will do, to keep workers safe.",
    provider: "Applicant",
    get: (p) => intervention(p).osh_commitment,
  },

  // ImpactProtocol draft -----------------------------------------------------
  {
    key: "impact.title",
    section: "impact",
    label: "Project title",
    kind: "text",
    required: true,
    needs: "A title the applicant has read and approved.",
    provider: "Applicant",
    get: (p) => p.impact.title,
  },
  {
    key: "impact.location",
    section: "impact",
    label: "Location",
    kind: "text",
    required: true,
    needs: "Where the project happens, matching the business address.",
    provider: "Applicant",
    get: (p) => p.impact.location,
  },
  {
    key: "impact.sector",
    section: "impact",
    label: "Sector",
    kind: "text",
    required: true,
    needs: "A sector from the ImpactProtocol list, or a request to add a missing one.",
    provider: "Programme team",
    get: (p) => p.impact.sector,
  },
  {
    key: "impact.sdgs",
    section: "impact",
    label: "Sustainable Development Goals",
    kind: "sdgs",
    required: true,
    needs: "The goals the project contributes to, explained to and confirmed by the applicant.",
    provider: "Applicant",
    get: (p) => p.impact.sdgs,
  },
  {
    key: "impact.funding_target_etb",
    section: "impact",
    label: "Funding target (ETB)",
    kind: "money",
    required: true,
    needs: "The sum of the priced items, backed by supplier quotes.",
    provider: "Supplier quote",
    get: (p) => p.impact.funding_target_etb,
  },
  {
    key: "impact.beneficiaries",
    section: "impact",
    label: "Beneficiaries",
    kind: "list",
    required: true,
    needs: "Who benefits and roughly how many people.",
    provider: "Applicant",
    get: (p) => p.impact.beneficiaries,
  },
  {
    key: "impact.milestones",
    section: "impact",
    label: "Milestones",
    kind: "milestones",
    required: true,
    needs: "Three to five concrete steps with a target month each.",
    provider: "Applicant",
    get: (p) => p.impact.milestones,
  },
];

export const FIELD_BY_KEY: Record<string, FormField> = Object.fromEntries(
  FORM_FIELDS.map((field) => [field.key, field]),
);

export function fieldsInSection(section: SectionId): FormField[] {
  return FORM_FIELDS.filter((field) => field.section === section);
}

export function sectionLabel(section: SectionId): string {
  const found = SECTIONS.find((s) => s.id === section);
  if (!found) return section;
  return section === "licence" ? found.title : `${section} ${found.title}`;
}
