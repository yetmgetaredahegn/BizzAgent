/*
 * TypeScript mirrors of the FastAPI/Pydantic schemas in backend/src/bizzagent/schemas,
 * plus view types the web app layers on top (provenance, evaluation).
 * Keep the mirrored shapes in sync with the Python models.
 */

// ---------------------------------------------------------------------------
// Mirrors of backend/src/bizzagent/schemas/company.py
// ---------------------------------------------------------------------------

export const BUSINESS_ORGANIZATIONS = [
  "Sole Proprietorship",
  "Private Limited Company",
  "Share Company",
  "Other",
] as const;
export type BusinessOrganization = (typeof BUSINESS_ORGANIZATIONS)[number];

export type Gender = "Female" | "Male" | "Other" | "Unknown";

export interface CompanyOwnership {
  women_percentage: number;
  men_percentage: number;
}

export interface CompanyProfile {
  company_name: string | null;
  business_registration_number: string | null;
  address: string | null;
  mobile_number: string | null;
  email: string | null;
  form_of_business_organization: BusinessOrganization | null;
  number_of_years_in_operation: number | null;
  type_of_business: string | null;
  ownership: CompanyOwnership | null;
}

export interface GrowthIndicator {
  year: number;
  sales_etb: number | null;
  total_employees: number | null;
  female_employees: number | null;
  youth_employees_18_24: number | null;
}

export interface CompanyOverview {
  description: string | null;
  growth_indicators: GrowthIndicator[];
}

export interface ProductService {
  product_service: string | null;
  market_served: string | null;
  distribution_channels: string | null;
}

export const PRODUCT_UNIQUENESS = {
  NEW_IN_ETHIOPIA: "New product/service in Ethiopia",
  DIFFERENT_FROM_COMPETITORS:
    "Product/service not new to Ethiopia but different from competitors",
  NO_UNIQUE_FEATURES: "Product/service with no unique features",
} as const;
export type ProductUniqueness =
  (typeof PRODUCT_UNIQUENESS)[keyof typeof PRODUCT_UNIQUENESS];

export interface ManagementTeamMember {
  name: string | null;
  position: string | null;
  gender: Gender | null;
}

export interface CompanyManagement {
  core_management_team: ManagementTeamMember[];
  organogram: string | null;
}

export interface ApplicantDescription {
  company_profile: CompanyProfile;
  company_overview: CompanyOverview;
  motivation: string | null;
  business_goals: string | null;
  market_overview: string | null;
  products_services: ProductService[];
  product_uniqueness: ProductUniqueness | null;
  local_raw_material_percentage: number | null;
  management: CompanyManagement;
}

// ---------------------------------------------------------------------------
// Mirrors of backend/src/bizzagent/schemas/intervention.py
// ---------------------------------------------------------------------------

export const EXPECTED_RESULTS = {
  NEW_PRODUCT_SERVICE: "New product/service",
  PRODUCT_SERVICE_DIVERSIFICATION: "Product/service diversification",
  REACHING_NEW_CLIENTS: "Reaching new clients",
  REACHING_NEW_MARKETS: "Reaching new markets",
  ENHANCING_PRODUCTION_CAPACITY: "Enhancing production capacity",
  IMPROVING_PRODUCT_SERVICE_QUALITY: "Improving product/service quality",
  FINANCIAL_SUSTAINABILITY: "Financial sustainability",
} as const;
export type ExpectedResult =
  (typeof EXPECTED_RESULTS)[keyof typeof EXPECTED_RESULTS];

export interface RequestedEquipment {
  description: string | null;
  quantity: number | null;
  estimated_total_price_etb: number | null;
  purpose: string | null;
}

export interface RequestedConsultant {
  problem_challenge_description: string | null;
  technical_expertise_request: string | null;
}

export interface JobPosition {
  job_position: string | null;
  number_of_new_jobs: number | null;
}

export interface InterventionRequest {
  problem_description: string | null;
  equipment: RequestedEquipment[];
  consultants: RequestedConsultant[];
  expected_results: ExpectedResult[];
  expected_results_explanation: string | null;
  job_creation_explanation: string | null;
  job_positions: JobPosition[];
  social_environmental_impact: string | null;
  osh_commitment: string | null;
}

// ---------------------------------------------------------------------------
// Mirrors of application.py, evidence.py, gaps.py, impact.py and
// legacy/interview/schemas.py
// ---------------------------------------------------------------------------

export interface Evidence {
  source: string;
  value: unknown;
  confidence?: number | null;
}

export interface ApplicationData {
  applicant: ApplicantDescription;
  intervention: InterventionRequest;
  evidence: Evidence[];
}

export interface TranscriptionResult {
  text: string;
  language: string | null;
}

export interface FileMetadata {
  filename: string;
  content_type: string;
}

export interface InformationGap {
  field: string;
  status: string;
  reason: string;
  required_evidence: string | null;
  provider: string | null;
}

export interface Milestone {
  description: string;
  target: string | null;
}

export interface ImpactProtocolDraft {
  title: string | null;
  location: string | null;
  sdgs: string[];
  funding_target_etb: number | null;
  beneficiaries: string[];
  milestones: Milestone[];
  sector: string | null;
}

/** Response of POST /applications/process: what was checked, nothing more. */
export interface DocumentCheckResponse {
  status: string;
  files: {
    license: FileMetadata;
    workshop: FileMetadata;
  };
  checks: Record<string, boolean>;
}

export interface InterviewQuestion {
  field: string;
  question: string;
}

export interface InterviewTurn {
  field: string;
  question: string;
  transcript: string;
}

export interface InterviewState {
  application: ApplicationData;
  current_question: InterviewQuestion | null;
  completed_fields: string[];
  audio_url: string | null;
  history: InterviewTurn[];
}

export interface InterviewAnswerResponse {
  state: InterviewState;
  transcript: TranscriptionResult;
}

// ---------------------------------------------------------------------------
// Web view types
// ---------------------------------------------------------------------------

export type Lang = "en" | "am" | "om";

export type FieldStatus =
  | "established"
  | "unverified"
  | "missing"
  | "contradictory";

/**
 * Where a value came from. The language model is deliberately not a source:
 * it interprets evidence, it does not create it. "draft_for_approval" marks
 * wording BizzAgent proposed that the applicant still has to approve.
 */
export type EvidenceSource =
  | "applicant_voice"
  | "applicant_followup"
  | "applicant_typed"
  | "licence"
  | "workshop_photo"
  | "supporting_document"
  | "system_calculation"
  | "draft_for_approval";

export interface Provenance {
  status: FieldStatus;
  source?: EvidenceSource;
  evidence?: string;
  note?: string;
}

/** Details read from the paper licence; not part of the backend form schema. */
export interface LicenceInfo {
  licence_number: string | null;
  registration_date: string | null;
  valid_until: string | null;
  business_activity: string | null;
}

export type SectorCategory =
  | "agro_processing"
  | "manufacturing"
  | "services"
  | "technology"
  | "trade"
  | "hospitality";

export interface PackContext {
  region: string | null;
  town: string | null;
  sector_category: SectorCategory | null;
  /** Answer to "Is another donor paying for this same intervention?" */
  prior_funding_same_intervention: boolean | null;
}

export interface Persona {
  name: string;
  age?: number;
  role: string;
  place: string;
  device: string;
  story: string;
}

export interface VoiceNote {
  language: Lang;
  duration: string;
  excerpt: string;
}

export interface ApplicationPack {
  id: string;
  kind: "demo" | "live" | "imported";
  language: Lang;
  persona?: Persona;
  voiceNote?: VoiceNote;
  submittedAt?: string;
  data: ApplicationData;
  licence: LicenceInfo;
  /** Which photos were received and passed the automated document check. */
  documents?: { licence_photo?: boolean; workshop_photo?: boolean };
  context: PackContext;
  impact: ImpactProtocolDraft;
  /** Keyed by form-schema field key, e.g. "company_profile.email". */
  provenance: Record<string, Provenance>;
}

export type DeclarationId = "truthful" | "verification" | "no_double_funding";

export interface DeclarationRecord {
  id: DeclarationId;
  understood?: { language: Lang; at: string };
  question?: { language: Lang; at: string };
  /** Only ever set by the applicant's own click. BizzAgent never sets it. */
  applicantTickedAt?: string;
}
