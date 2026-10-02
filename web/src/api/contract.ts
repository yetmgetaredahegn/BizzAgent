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

export type BizzAgentApi = AccountsApi & ConversationsApi & InboxApi & MissionsApi & ActivityApi;
