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
import type { Lang } from "@/lib/types";

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

export type BizzAgentApi = AccountsApi;
