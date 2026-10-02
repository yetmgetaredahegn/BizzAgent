/*
 * The BizzAgent API contract the prototype is built on (docs/engineering/api.md).
 * `mockClient` implements it over fictional seed data; PR D adds `httpClient`
 * and checks it against OpenAPI-generated types.
 *
 * Differences from the HTTP contract, for the prototype only: text the backend
 * would localise is returned as a message id plus variables (`Msg`) and
 * translated in the UI.
 */

import type { Stage } from "@/components/ds/fidel-journey";
import type { FieldStatus, Lang } from "@/lib/types";

export type { Lang, Stage };

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface Msg {
  id: string;
  vars?: Record<string, string | number>;
}

export type FieldStatusCounts = {
  established: number;
  unverified: number;
  missing: number;
  contradictory: number;
};

// ---------------------------------------------------------------------------
// Accounts, workspaces, roles
// ---------------------------------------------------------------------------

export type WorkspaceType = "explorer" | "team" | "business" | "collective" | "partner";

export type LegalForm =
  | "informal"
  | "sole_proprietorship"
  | "one_member_plc"
  | "plc"
  | "share_company"
  | "general_partnership"
  | "limited_partnership"
  | "other"
  | "cooperative"
  | "association_cso"
  | "ngo"
  | "savings_group";

export type PartnerKind = "funder" | "program" | "support_org";

export type Role =
  | "owner"
  | "co_founder"
  | "manager"
  | "finance"
  | "member"
  | "helper"
  | "advisor"
  | "viewer"
  | "org_admin"
  | "program_manager"
  | "reviewer"
  | "mentor"
  | "platform_admin"
  | "content_reviewer"
  | "moderator";

export interface WorkspaceSummary {
  id: string;
  name: string;
  type: WorkspaceType;
  legalForm?: LegalForm;
  partnerKind?: PartnerKind;
  role: Role;
  /** Only authorised signatories can tick declarations and submit. */
  signatory: boolean;
  stage?: Stage;
}

export interface Persona {
  id: string;
  name: string;
  /** Developer-only description shown in the prototype's persona switcher. */
  blurb: string;
  language: Lang;
  kind: "venture" | "partner";
  workspaces: WorkspaceSummary[];
}

export interface Me {
  personaId: string;
  name: string;
  language: Lang;
  workspaces: WorkspaceSummary[];
  credits: number;
}

export interface CreateAccountInput {
  phone: string;
  language: Lang;
  path: WorkspaceType;
  legalForm?: LegalForm;
  partnerKind?: PartnerKind;
  name?: string;
  /** Facts gathered by the onboarding interview (each confirmed by read-back). */
  profile?: { business?: string; activity?: string; town?: string; staff?: number };
}

// ---------------------------------------------------------------------------
// Artifacts (summary; detail shapes are added with each artifact view)
// ---------------------------------------------------------------------------

export type ArtifactKind =
  | "profile"
  | "legal"
  | "launch"
  | "idea"
  | "validation"
  | "market"
  | "entry"
  | "finance"
  | "proposal"
  | "accelerator"
  | "growth"
  | "explainer"
  | "hiring";

export interface ArtifactSummary {
  id: string;
  kind: ArtifactKind;
  title: string;
  version: number;
  /** 0..1 */
  completeness: number;
  stamps: FieldStatusCounts;
  updatedAt: string;
  producedBy?: { agent: string; missionId?: string };
}

// ---------------------------------------------------------------------------
// Home and the journey planner
// ---------------------------------------------------------------------------

export interface NextAction {
  id: string;
  title: Msg;
  /** Why this action: always names the gap, deadline or approval behind it. */
  why: Msg;
  href: string;
  skill: string;
  highlight?: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  /** ISO date (Gregorian). The UI shows it as a DualDate. */
  iso: string;
}

export interface HomeData {
  workspace: WorkspaceSummary;
  stage: Stage;
  nextActions: NextAction[];
  inboxCount: number;
  missions: MissionSummary[];
  deadlines: Deadline[];
  recent: ArtifactSummary[];
}

export interface MissionSummary {
  id: string;
  title: Msg;
  status: "planned" | "running" | "waiting" | "done" | "paused";
  progress: { done: number; total: number };
  nextStep?: Msg;
}

// ---------------------------------------------------------------------------
// Calculations (shared by sheets and artifacts)
// ---------------------------------------------------------------------------

export interface CalcStepDto {
  label: string;
  op?: "+" | "−" | "×" | "÷" | "=";
  value: number;
  input?: string;
  unit?: "birr" | "percent" | "count" | "months";
}

export interface CalcResultDto {
  value: number;
  unit: "birr" | "percent" | "count" | "months";
  steps: CalcStepDto[];
  warnings: string[];
}

export interface CostEstimateDto {
  action: Msg;
  creditsMin: number;
  creditsMax: number;
  balanceAfter: number;
  capRemaining: number | null;
}

// ---------------------------------------------------------------------------
// Conversations (concierge)
// ---------------------------------------------------------------------------

export type TalkTopic = "general" | "numbers" | "idea" | "setup" | "entry";

export type Turn =
  | { id: string; role: "agent"; msg: Msg }
  | { id: string; role: "user"; text: string; via: "voice" | "text" }
  | { id: string; role: "stage"; msg: Msg };

export type Pending =
  | { kind: "ask"; prompt: Msg; why?: Msg; sample?: Msg; field: string }
  | { kind: "readback"; text: Msg | string; field: string }
  | { kind: "cost"; estimate: CostEstimateDto }
  | { kind: "choice"; options: { id: string; label: Msg; href?: string }[] }
  | null;

export interface SheetMargin {
  kind: "margin";
  inputs: { price: number; cost: number };
  base: CalcResultDto;
  whatIf?: { price: number; result: CalcResultDto };
}

export interface SheetIdea {
  kind: "idea";
  version: number;
  approved: boolean;
  fields: { key: "oneLiner" | "customer" | "problem" | "solution" | "alternatives"; value: string | null; status: FieldStatus }[];
}

export interface SheetEntry {
  kind: "entry";
  market: string;
  rows: { key: string; value: Msg | string; status: FieldStatus; demo?: boolean }[];
  competitors: { name: string; reach: "global" | "local"; source: string }[];
}

export interface SheetAdvisor {
  kind: "advisor";
  owners?: string;
  questions: Msg[];
}

export type Sheet = SheetMargin | SheetIdea | SheetEntry | SheetAdvisor;

export interface Conversation {
  id: string;
  workspaceId: string;
  topic: TalkTopic;
  turns: Turn[];
  pending: Pending;
  sheet: Sheet | null;
  /** Increments whenever the sheet changes (the UI badges the Sheet tab). */
  sheetVersion: number;
  canUndo: boolean;
}

export type ConversationEvent =
  | { type: "text"; text: string; via: "voice" | "text" }
  | { type: "confirm" }
  | { type: "fix" }
  | { type: "choose"; id: string }
  | { type: "costConfirm" }
  | { type: "costCancel" }
  | { type: "undo" };

// ---------------------------------------------------------------------------
// Inbox (approvals and questions)
// ---------------------------------------------------------------------------

export type InboxKind = "submit" | "share" | "send" | "publish" | "spend" | "advisor" | "ask";

export interface InboxItem {
  id: string;
  type: "approval" | "question";
  kind: InboxKind;
  title: Msg | string;
  why: Msg | string;
  evidence: { label: string; status: FieldStatus }[];
  cost?: CostEstimateDto;
  /** Minutes the user can undo after approving; absent when the action cannot be undone. */
  undoMinutes?: number;
  missionId?: string;
  /** For questions: how many tasks answering it unblocks. */
  unblocks?: number;
  status: "pending" | "approved" | "declined";
  decidedVia?: "tap" | "voice";
  /** For questions: a sample answer used by the prototype's voice input. */
  sample?: string;
  answer?: string;
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export const MISSION_TEMPLATES = ["funded", "register", "launch", "accelerator", "market", "validate", "hire", "monthly"] as const;

export type MissionTemplate = (typeof MISSION_TEMPLATES)[number];

export type MissionStatus = "planned" | "running" | "waiting" | "done" | "paused" | "cancelled";

export type TaskStatus = "done" | "running" | "waiting" | "pending";

export interface MissionTask {
  id: string;
  /** Step vocabulary id, translated as `mstep.<step>`. */
  step: string;
  owner: string;
  status: TaskStatus;
  /** A step that needs the user's approval before it can run. */
  approval?: boolean;
  verifiers?: { name: "grounding" | "rules" | "language" | "policy"; result: "pass" | "revised" | "unverified" }[];
  artifactId?: string;
}

export interface Mission {
  id: string;
  workspaceId: string;
  template: MissionTemplate;
  title: Msg | string;
  status: MissionStatus;
  tasks: MissionTask[];
  estimate: CostEstimateDto;
  spent: number;
  forkedFrom?: string;
}

export interface MissionsApi {
  listMissions(workspaceId: string): Promise<Mission[]>;
  getMission(workspaceId: string, missionId: string): Promise<Mission>;
  planMission(workspaceId: string, input: { template?: MissionTemplate; goal?: string }): Promise<Mission>;
  startMission(workspaceId: string, missionId: string): Promise<Mission>;
  setMissionStatus(workspaceId: string, missionId: string, status: "paused" | "running" | "cancelled"): Promise<Mission>;
  forkMission(workspaceId: string, missionId: string): Promise<Mission>;
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export interface ActivityEvent {
  id: string;
  /** ISO date-time. */
  at: string;
  agent: string;
  action: Msg | string;
  sources: string[];
  approval?: { by: string; via: "tap" | "voice" };
  credits: number;
  missionId?: string;
}

// ---------------------------------------------------------------------------
// Business File: artifact details
// ---------------------------------------------------------------------------

/** A source shown as a CitationSlip. Every research or legal row has one, or says it has none. */
export interface Citation {
  title: string;
  /** Domain or pack entry id. */
  origin: string;
  retrieved?: string;
  /** Prototype data is fictional and marked as such. */
  demo: boolean;
  verified: boolean;
}

export interface FieldRow {
  key: Msg | string;
  value: Msg | string;
  status: FieldStatus;
  source?: Msg | string;
}

export interface ChecklistItem {
  id: string;
  text: Msg;
  done: boolean;
  status: FieldStatus;
  /** `null` means "no verified answer": the UI says so instead of guessing. */
  citation: Citation | null;
}

export interface IdeaVersion {
  n: number;
  approved: boolean;
  fields: Record<"oneLiner" | "customer" | "problem" | "solution" | "alternatives", string>;
}

export interface Assumption {
  id: string;
  text: string;
  /** 1..5 each; risk = impact × uncertainty (computed by the rubric, never by the model). */
  impact: number;
  uncertainty: number;
  confidence: "assumed" | "tested";
  experiment?: string;
}

export interface Competitor {
  name: string;
  reach: "global" | "local";
  note: string;
  citation: Citation;
}

export interface RubricRow {
  criterion: Msg;
  weight: number;
  /** 1..5 */
  score: number;
  status: FieldStatus;
}

export interface AcceleratorQuestion {
  id: string;
  prompt: string;
  limit: number;
  draft: string;
  /** The artifacts every claim in the draft traces to. */
  claims: { label: string; kind: ArtifactKind }[];
}

export interface ExplainerClause {
  id: string;
  page: number;
  /** A quoted span of the (fictional) document. */
  quote: string;
  kind: "obligation" | "date" | "money" | "term" | "risk";
  explanation: Msg;
  redFlag: boolean;
  action?: "calendar" | "expert" | "task";
  done?: "calendar" | "expert" | "task";
}

export interface Candidate {
  id: string;
  /** Fictional first name only; screening shows no photo and no protected attributes. */
  name: string;
  criteria: { criterion: Msg; weight: number; score: number; quote: string }[];
}

export interface Objective {
  id: string;
  title: Msg;
  kpis: { label: Msg; value: number; unit: "birr" | "percent" | "count"; basis: "ledger" | "target" }[];
  initiatives: Msg[];
}

interface ArtifactBase {
  id: string;
  title: string;
  version: number;
  updatedAt: string;
  completeness: number;
  stamps: FieldStatusCounts;
  producedBy?: { agent: string; missionId?: string };
}

export type ArtifactDetail = ArtifactBase &
  (
    | { kind: "profile"; rows: FieldRow[] }
    | {
        kind: "finance";
        inputs: { label: Msg; value: number; unit: "birr" | "percent" | "count"; status: FieldStatus; source: Msg }[];
        results: { id: string; label: Msg; calc: CalcResultDto }[];
        whatIf: { price: number; cost: number } | null;
        cashFlow?: { month: string; inflow: number; outflow: number; balance: number }[];
      }
    | { kind: "legal"; form: LegalForm; reasons: Msg[]; steps: ChecklistItem[] }
    | { kind: "launch"; legal: ChecklistItem[]; technical: ChecklistItem[] }
    | { kind: "idea"; versions: IdeaVersion[] }
    | { kind: "validation"; assumptions: Assumption[]; interviews: { id: string; who: string; learned: string }[] }
    | {
        kind: "market";
        market: string;
        sizing: CalcResultDto;
        sizingInputs: { label: Msg; value: number; unit: "birr" | "percent" | "count" }[];
        competitors: Competitor[];
        gaps: { dimension: Msg; note: string }[];
      }
    | {
        kind: "entry";
        market: string;
        rubric: RubricRow[];
        attractiveness: CalcResultDto;
        entryMode: { id: string; reasons: Msg[] };
        costToEnter: CalcResultDto;
        breakEven: CalcResultDto;
        requirements: { text: Msg; citation: Citation | null }[];
      }
    | { kind: "proposal"; funder: string; call: string; provisionalScore: number | null; gaps: number; submitted: boolean; href: string }
    | { kind: "accelerator"; programme: string; deadline: string; questions: AcceleratorQuestion[] }
    | { kind: "explainer"; document: string; summary: Msg; clauses: ExplainerClause[] }
    | {
        kind: "hiring";
        role: string;
        jd: Record<Lang, string>;
        candidates: Candidate[];
      }
    | { kind: "growth"; objectives: Objective[] }
  );

export type CalcName = "margin" | "markup" | "breakEven";

export interface ArtifactsApi {
  listArtifacts(workspaceId: string): Promise<ArtifactSummary[]>;
  getArtifact(workspaceId: string, artifactId: string): Promise<ArtifactDetail>;
  calc(name: CalcName, inputs: Record<string, number>): Promise<CalcResultDto>;
  approveIdea(workspaceId: string, artifactId: string, version: number): Promise<ArtifactDetail>;
  toggleChecklistItem(workspaceId: string, artifactId: string, itemId: string, done: boolean): Promise<ArtifactDetail>;
  saveDraft(workspaceId: string, artifactId: string, questionId: string, text: string): Promise<ArtifactDetail>;
  explainerAction(workspaceId: string, artifactId: string, clauseId: string, action: NonNullable<ExplainerClause["action"]>): Promise<ArtifactDetail>;
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export const OPPORTUNITY_TYPES = [
  "grant_call",
  "incubator",
  "accelerator",
  "investor",
  "hackathon",
  "competition",
  "fellowship",
  "tender",
  "trade_fair",
  "loan_product",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const PIPELINE_STAGES = ["found", "shortlisted", "preparing", "submitted", "outcome"] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  provider: string;
  /** ISO date, or null for a rolling opportunity. */
  deadline: string | null;
  daysLeft: number | null;
  closingSoon: boolean;
  benefit: string;
  languages: Lang[];
  source: { kind: "platform" | "curated" | "discovered"; domain: string; retrieved: string };
  onPlatform: boolean;
  /** Deterministic: "likely" means a fact it rests on is still unverified. */
  eligibility: { state: "eligible" | "likely" | "not"; reasons: Msg[]; confirm: Msg[] };
  fit: Msg[];
  /** Scam-guard reasons; empty when nothing was flagged. */
  scam: Msg[];
  requirements: { text: Msg; kind: ArtifactKind; status: FieldStatus; artifactId?: string }[];
  stage: PipelineStage | null;
  demo: true;
}

export interface OpportunityFilters {
  type?: OpportunityType;
  closingSoon?: boolean;
}

export interface OpportunitiesApi {
  listOpportunities(workspaceId: string, filters?: OpportunityFilters): Promise<Opportunity[]>;
  getOpportunity(workspaceId: string, opportunityId: string): Promise<Opportunity>;
  setPipelineStage(workspaceId: string, opportunityId: string, stage: PipelineStage | null): Promise<Opportunity>;
  reportOpportunity(workspaceId: string, opportunityId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Funding readiness, common application, passport and document verification
// ---------------------------------------------------------------------------

export interface ReadinessComponent {
  id: "evidence" | "ledger" | "documents" | "legal" | "consistency";
  points: number;
  max: number;
  note: Msg;
}

export interface ReadinessAction {
  id: string;
  title: Msg;
  /** Points the score would gain if this were done. */
  raises: number;
  href: string;
}

export interface Readiness {
  score: number;
  components: ReadinessComponent[];
  /** The three that raise the score most, never more. */
  actions: ReadinessAction[];
}

export interface CommonField {
  id: string;
  label: Msg;
  status: FieldStatus;
  source: Msg;
  /** Ids of the calls whose form asks for this answer. */
  requiredBy: string[];
}

export interface CommonApplication {
  calls: { id: string; title: string }[];
  fields: CommonField[];
}

export interface PassportShare {
  id: string;
  token: string;
  scope: "basic" | "full";
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  /** Worked out by the API from the dates and the revoke switch. */
  state: "ok" | "expired" | "revoked";
  views: { at: string; who: Msg }[];
}

export interface PassportData {
  business: string;
  facts: FieldRow[];
  shares: PassportShare[];
}

export type SharedPassport =
  | { state: "ok"; business: string; facts: FieldRow[]; expiresAt: string }
  | { state: "expired" | "revoked" | "unknown" };

export type DocumentFormat = "docx" | "pdf" | "xlsx" | "json";

export interface DocumentRecord {
  id: string;
  title: string;
  format: DocumentFormat;
  language: Lang;
  artifactId: string;
  artifactTitle: string;
  artifactKind: ArtifactKind;
  version: number;
  createdAt: string;
  /** SHA-256 of the file, hex. The footer shows the first 12 characters. */
  hash: string;
  provenance: FieldStatusCounts;
}

/** What the public verification page may show: the issuer's name only, never the content. */
export interface PublicDocument {
  id: string;
  title: string;
  issuer: string;
  format: DocumentFormat;
  createdAt: string;
  provenance: FieldStatusCounts;
  verifiers: ("grounding" | "rules" | "language")[];
}

export interface TrustApi {
  getReadiness(workspaceId: string): Promise<Readiness>;
  getCommonApplication(workspaceId: string): Promise<CommonApplication>;
  getPassport(workspaceId: string): Promise<PassportData>;
  createShare(workspaceId: string, input: { scope: PassportShare["scope"]; days: number }): Promise<PassportShare>;
  revokeShare(workspaceId: string, shareId: string): Promise<void>;
  /** Public: opens a shared Passport by its token and records the view. */
  openSharedPassport(token: string): Promise<SharedPassport>;
  listDocuments(workspaceId: string): Promise<DocumentRecord[]>;
  /** The text of the prototype's sample file for a document (a real export would be DOCX, PDF or XLSX). */
  getDocumentText(documentId: string): Promise<string>;
  /** Public: summary for the verification page, or null when there is no such document. */
  getPublicDocument(documentId: string): Promise<PublicDocument | null>;
  /** Public: compares the SHA-256 of a file the visitor holds with the one recorded at export. */
  verifyDocument(documentId: string, sha256: string): Promise<"match" | "altered">;
}

// ---------------------------------------------------------------------------
// The API
// ---------------------------------------------------------------------------

export interface AccountsApi {
  listPersonas(): Promise<Persona[]>;
  me(): Promise<Me>;
  setPersona(personaId: string): Promise<void>;
  createAccount(input: CreateAccountInput): Promise<Me>;
  updateLanguage(language: Lang): Promise<void>;
  home(workspaceId: string): Promise<HomeData>;
  inboxCount(workspaceId: string): Promise<number>;
}

export interface ConversationsApi {
  startConversation(workspaceId: string, topic?: TalkTopic): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation>;
  sendEvent(id: string, event: ConversationEvent): Promise<Conversation>;
}

export interface InboxApi {
  listInbox(workspaceId: string): Promise<InboxItem[]>;
  decide(workspaceId: string, itemId: string, decision: "approve" | "decline", via: "tap" | "voice"): Promise<InboxItem>;
  batchApprove(workspaceId: string, itemIds: string[]): Promise<InboxItem[]>;
  answerQuestion(workspaceId: string, itemId: string, answer: string): Promise<InboxItem>;
}

export interface ActivityApi {
  listActivity(workspaceId: string): Promise<ActivityEvent[]>;
}

export type BizzAgentApi = AccountsApi & ConversationsApi & InboxApi & MissionsApi & ActivityApi & ArtifactsApi & OpportunitiesApi & TrustApi;
