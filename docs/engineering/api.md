# API v1 contract

> **What this is:** every endpoint the product needs: paths, request and response shapes, errors, auth and billing. The prototype's `web/src/api/contract.ts` mirrors this, and the backend implements it.
> **Who reads it:** front-end and back-end engineers.
> **Last reviewed:** 2026-10-02

Shapes use TypeScript-like notation; the Pydantic models in `bizzagent` are authoritative once
they exist. Persistent shapes are in [data-model](data-model.md).

## 1. Conventions

- **Base path:** `/v1`. JSON in and out, except uploads (multipart) and streams (SSE).
- **Auth:**
  - `Authorization: Bearer <user token>` for users.
  - `X-Org-Key: <key>` for partner automation.
  - Public routes are marked 🌐.
- **Workspace scoping:** `{ws}` in the path. Requests outside the caller's memberships or
  consent grants return **404**, not 403 (`NFR-TEN-001`).
- **Language:** `Accept-Language: am|om|en` overrides the profile language for the response
  text.
- **Errors:**

  ```ts
  { error: { code: string; message: string /* localised */; details?: object } }
  ```

  | Code | Status |
  |---|---|
  | `validation_error` | 422 |
  | `not_found` | 404 |
  | `conflict_turn_running` | 409 |
  | `insufficient_credits` | 402 |
  | `cap_exceeded` | 402 |
  | `approval_required` | 409 |
  | `forbidden_action` | 403, an L3 or signatory violation |
  | `rate_limited` | 429 |

- **Billing:**
  - Metered endpoints accept `X-Confirm-Estimate: <estimate_id>`.
  - Without it, an action above the threshold returns **409 `approval_required`** with a
    `CostEstimate`.
  - Responses include an `X-Credits-Charged` header.
- **Pagination:** `?cursor=&limit=` → `{ items, next_cursor }`.
- **Idempotency:** `Idempotency-Key` header on POSTs that create or charge.

### Shared shapes

```ts
type Lang = "en" | "am" | "om";
type Status = "established" | "unverified" | "missing" | "contradictory";
type Source =
  | { kind: "user_voice" | "user_text"; turn_id: string; quote: string }
  | { kind: "user_document" | "workshop_photo"; media_id: string; span?: Span }
  | { kind: "ledger"; entry_ids: string[] }
  | { kind: "calculation"; trace_id: string }
  | { kind: "research"; url: string; retrieved_at: string; snapshot_id: string }
  | { kind: "knowledge"; entry_id: string; version: string; verified: boolean }
  | { kind: "assumption"; confirmed_at: string }
  | { kind: "remembered" | "imported"; memory_id: string }
  | { kind: "draft_for_approval"; draft_id: string }
  | { kind: "expert_review"; by: string; credential: string; date: string; scope: string };
type Provenance = { status: Status; source?: Source; evidence?: string; note?: string };
type Field<T> = { value: T | null; provenance: Provenance };
type Money = { amount: number; currency: "ETB" | "USD" };
type DualDate = { gc: string /* ISO */; ec: { y: number; m: number; d: number } };
type CostEstimate = {
  estimate_id: string; action: string;
  credits_min: number; credits_max: number;
  balance_after: number; cap_remaining: number | null;
};
type Citation = {
  title: string; url?: string; entry_id?: string;
  retrieved_at?: string; verified?: boolean;
};
```

## 2. Accounts and workspaces

| Method | Path | Body → Response |
|---|---|---|
| POST 🌐 | `/accounts` | `{phone, language, path: "explorer"\|"team"\|"business"\|"collective"\|"partner", legal_form?, partner_kind?, name?}` → `{user, token, workspace}` |
| GET | `/me` | → `{user, language, workspaces: WorkspaceSummary[], personal_space_id}` |
| PATCH | `/me` | `{language?, name?, preferences?}` → `User` |
| DELETE | `/me` | → 204 (free; deletes the account and the personal space) |
| GET | `/me/export` | → a JSON archive (free) |
| POST | `/workspaces` | `{type, legal_form?, name}` → `Workspace` |
| GET | `/workspaces/{ws}` | → `Workspace{id, type, legal_form, name, stage, members_count}` |
| PATCH | `/workspaces/{ws}` | `{name?, legal_form?}`; a legal-form change goes through the guided flow and writes an audit event |
| GET | `/workspaces/{ws}/members` | → `Member{user, role, authorised_signatory, consent?}[]` |
| POST | `/workspaces/{ws}/invitations` | `{phone, role, consent?: {scope, artifacts, expires_at}}` → `Invitation` |
| PATCH / DELETE | `/workspaces/{ws}/members/{user}` | Role or signatory change; removal |
| GET / POST | `/workspaces/{ws}/consents` | List / create a `ConsentGrant` |
| DELETE | `/workspaces/{ws}/consents/{id}` | Revoke |
| GET | `/workspaces/{ws}/consents/{id}/access-log` | → `AccessEvent[]` |
| GET | `/me/capabilities?ws=` | → `{capabilities: string[]}` (the UI uses it to hide actions) |

## 3. Conversations (concierge)

| Method | Path | Body → Response |
|---|---|---|
| POST | `/conversations` | `{workspace_id?, language?}` → `{id, prompt: Prompt}` |
| POST | `/conversations/{id}/turns` | JSON `{text}`, or multipart `audio` + `language?` → `{turn_id, transcript?, prompt: Prompt, artifacts_changed: ArtifactRef[], cost?: {credits}}`. 409 if a turn is running |
| GET | `/conversations/{id}/events` | **SSE** stream; see below |
| PUT | `/conversations/{id}/language` | `{language}` → `{prompt}` (the re-phrased pending prompt) |
| POST | `/conversations/{id}/undo` | → `{prompt}` (time travel to before the last answer) |
| GET | `/conversations/{id}` | → `{messages, pending: Prompt \| null, language}` |

```ts
type Prompt = {
  key: string; text: string; audio_url?: string; why?: string;
  kind: "question" | "readback" | "choice" | "approval" | "info";
  options?: { id: string; label: string }[];
  turn_options: ("speak" | "type" | "repeat" | "explain" | "idk" | "skip")[];
  cost?: CostEstimate;
};
// SSE event data
type StreamEvent =
  | { type: "stage"; key: string; text: string }       // "Reading your licence…"
  | { type: "token"; text: string }                    // streaming reply text
  | { type: "artifact"; ref: ArtifactRef }
  | { type: "prompt"; prompt: Prompt }
  | { type: "error"; error: ApiError["error"] }
  | { type: "done" };
```

## 4. Artifacts

| Method | Path | Body → Response |
|---|---|---|
| GET | `/workspaces/{ws}/artifacts?kind=` | → `ArtifactSummary{id, kind, title, version, completeness, stamps: Record<Status, number>, updated_at}[]` |
| GET | `/artifacts/{id}?version=` | → `Artifact{id, kind, version, payload, fields: Record<string, Field<unknown>>, produced_by: {mission_id?, agent}}` |
| PATCH | `/artifacts/{id}` | `{fields: Record<string, unknown>}` → a new version (user edits become `user_text`) |
| GET | `/artifacts/{id}/versions` | → `{version, created_at, by}[]` |
| POST | `/artifacts/{id}/versions/{v}/approve` | Approves a draft version (idea clarifier, drafts) |

## 5. Calculators and knowledge

| Method | Path | Body → Response |
|---|---|---|
| GET | `/calcs` | → `{name, inputs: InputSpec[], description}[]` |
| POST | `/calcs/{name}` | `{inputs: Record<string, {value, source}>}` → `CalcResult{value, steps: Step[], inputs_used, warnings, trace_id}` (free) |
| GET | `/knowledge/search?q=&country=et&topic=` | → `{entries: {id, title, excerpt, citations: Citation[], verified, review_due}[]}` |
| GET | `/knowledge/{entry_id}` | → `KnowledgeEntry` |

```ts
type Step = { n: number; label: string; op: "+" | "-" | "×" | "÷" | "="; value: number; input?: string };
```

## 6. Funding: funders, calls, directory, proposals

| Method | Path | Body → Response |
|---|---|---|
| GET | `/funders` | → `Funder[]` (on-platform) |
| GET | `/directory?q=` | → `DirectoryEntry{id, name, url, instructions}[]` (off-platform) |
| GET | `/calls?sector=&region=&language=` | → `CallSummary[]` |
| GET | `/calls/{id}` | → `Call{..., config_version, config}` |
| POST | `/calls/{id}/proposals` or `/directory/{id}/proposals` | `{workspace_id}` → `Proposal` (pins the config version) |
| GET | `/proposals/{id}` | → `Proposal{fields, gaps, contradictions, evaluation, declarations, drafts, readiness}` |
| POST | `/proposals/{id}/media` | multipart `kind=licence\|workshop\|audio\|document` → `{media_id, check}` |
| POST | `/proposals/{id}/declarations/{decl}/understood` | `{language}` → `DeclarationRecord` |
| POST | `/proposals/{id}/declarations/{decl}/tick` | → `DeclarationRecord` (signatory only; user actor) |
| POST | `/proposals/{id}/drafts/{key}/approve` | `{text?}` → `Draft` |
| POST | `/proposals/{id}/submit` | → 409 `approval_required` (creates an inbox card) → after approval, `Submission` |
| GET | `/proposals/{id}/export?format=json\|docx\|pdf&lang=` | → file + a `DocumentRecord` header |
| GET | `/orgs/{slug}/proposals` | (partner) → the ranked list |
| GET | `/orgs/{slug}/proposals/{id}` | (partner) → application detail |
| POST | `/orgs/{slug}/proposals/{id}/override` | `{field?, score?, note}`; the note is required and audited |

Legacy routes (deprecated, removed in D):

- `POST /applications/process` → `DocumentCheckResponse`
- `/interview/*`

## 7. Opportunities, pipeline, Passport, readiness

| Method | Path | Body → Response |
|---|---|---|
| GET | `/opportunities?type=&sector=&region=&stage=&language=&closing_within=` | → `Opportunity[]` |
| GET | `/opportunities/{id}` | → `Opportunity{…, source: {kind, url, retrieved_at, snapshot_id}, status, scam_flags: {code, reason}[]}` |
| POST | `/opportunities/{id}/report` | `{reason}` → 202 |
| GET | `/workspaces/{ws}/matches` | → `Match{opportunity, eligibility: "eligible"\|"likely"\|"not", reasons, confirm?: string[], rank, fit}[]` |
| GET / POST / PATCH | `/workspaces/{ws}/pipeline` | `PipelineItem{id, opportunity_id, stage, checklist: {item, artifact_ref?, done}[], reminders}` |
| GET | `/workspaces/{ws}/readiness` | → `{score, components: {name, weight, value, explanation}[], top_actions: Action[]}` |
| GET | `/workspaces/{ws}/common-application?calls=a,b` | → `{fields: {key, label, per_call: Record<callId, "filled"\|"gap">}[]}` |
| GET | `/workspaces/{ws}/passport` | → `Passport{facts: {key, value, provenance}[]}` |
| POST | `/workspaces/{ws}/passport/shares` | `{scope, expires_at}` → `{token, url, qr_svg}` |
| DELETE | `/workspaces/{ws}/passport/shares/{id}` | Revoke |
| GET 🌐 | `/passport/{token}` | → a read-only Passport (the view is audited) |
| POST | `/orgs/{slug}/opportunities` | (partner) publish → `Opportunity` |

## 8. Missions, inbox, policies, activity

| Method | Path | Body → Response |
|---|---|---|
| GET | `/workspaces/{ws}/mission-templates` | → `Template[]` |
| POST | `/workspaces/{ws}/missions` | `{goal?: string, template?: string}` → `Mission{id, plan: Task[], estimate: CostEstimate, status: "planned"}` |
| POST | `/missions/{id}/start` | `X-Confirm-Estimate` → `Mission` |
| GET | `/missions/{id}` | → `Mission{…, tasks: {id, skill, owner, status, depends_on, verifier_results, artifacts}[]}` |
| POST | `/missions/{id}/{pause\|resume\|cancel}` | → `Mission` |
| POST | `/missions/{id}/fork` | `{from_checkpoint?, plan_changes?}` → `Mission` |
| PATCH | `/missions/{id}/plan` | Edit the plan (re-validated) |
| GET | `/workspaces/{ws}/inbox?type=approval\|question` | → `InboxItem[]` |
| POST | `/inbox/{id}/approve` | `{via: "tap"\|"voice", readback_confirmed?: boolean}` → `InboxItem` |
| POST | `/inbox/{id}/decline` | `{reason?}` |
| POST | `/inbox/batch-approve` | `{ids}`, all of the same type |
| POST | `/inbox/{id}/answer` | `{text}` or audio (question cards) |
| GET / PUT | `/workspaces/{ws}/autonomy` | `{per_skill: Record<skill, "L0"\|"L1"\|"L2"\|"L3">}` |
| POST | `/workspaces/{ws}/policies/parse` | `{text}` → `{policy, readback}` |
| POST | `/workspaces/{ws}/policies` | `{policy}` (confirmed) → `Policy` |
| GET / DELETE | `/workspaces/{ws}/policies/{id}` | — |
| GET | `/workspaces/{ws}/activity?mission=&agent=&cursor=` | → `ActivityEvent{at, agent, action, sources, approval?, credits}[]` |
| GET | `/workspaces/{ws}/activity/export?format=csv\|json` | — |

```ts
type InboxItem = {
  id: string; type: "approval" | "question"; title: string; why: string;
  evidence: { label: string; provenance: Provenance }[]; cost?: CostEstimate;
  undo_until?: string; mission_id?: string; unblocks?: number;
  status: "pending" | "approved" | "declined";
};
```

## 9. Memory and import

| Method | Path | Body → Response |
|---|---|---|
| GET | `/me/memory?topic=` | → `MemoryItem[]` |
| PATCH | `/me/memory/{id}` | Edit |
| DELETE | `/me/memory/{id}` | Hard delete |
| POST | `/me/memory/pause` | `{paused}` |
| GET | `/me/memory/export` | — |
| GET | `/me/memory/candidates` | → pending candidates |
| POST | `/me/memory/candidates/{id}/{confirm\|discard}` | — |
| GET | `/me/import/prompt?lang=` | → `{text}` (the copy-paste prompt) |
| POST | `/me/import` | `{text}`, or multipart `file` + `source: "chatgpt"\|"claude"\|"gemini"` → `{import_id, candidates: MemoryItem[]}` (the raw file is deleted) |

## 10. Money, ledger, personal space

| Method | Path | Body → Response |
|---|---|---|
| GET / POST | `/workspaces/{ws}/ledger` | `LedgerEntry{date, amount: Money, direction, category?, counterparty?, provenance}` |
| GET | `/workspaces/{ws}/statements?period=` | → income statement + cash position, with traces |
| GET | `/workspaces/{ws}/kpis` | → `{name, value, trace_id, source}[]` |
| POST | `/workspaces/{ws}/imports/statements` | multipart → `{import_id, format, preview: Row[], duplicates: number[]}` |
| POST | `/imports/{id}/mapping` | `{columns}` (CSV wizard) |
| POST | `/imports/{id}/commit` | `{rows, categories_confirmed}` |
| GET / PUT | `/me/personal/budget` | Owner only |
| GET / POST / PATCH | `/me/personal/goals` | Owner only |
| GET | `/me/personal/net-worth` | Owner only |
| POST | `/me/personal/shares` | `{aggregate: "owners_pay", workspace_id}` (an explicit share) |

`/me/personal/*` is reachable only with the owning user's token (`NFR-PRIV-001`).

## 11. Team and hiring

| Method | Path | Body → Response |
|---|---|---|
| GET / POST | `/workspaces/{ws}/jobs` | `JobOpening` |
| GET / PATCH | `/jobs/{id}` | — |
| POST | `/jobs/{id}/publish` | → approval card |
| GET | `/jobs/{id}/candidates` | → `Candidate{id, scores: {criterion, score, quotes}[], total}[]` (no protected attributes) |
| POST 🌐 | `/jobs/{id}/applications` | multipart CV or audio |

## 12. Documents and verification

| Method | Path | Body → Response |
|---|---|---|
| GET | `/workspaces/{ws}/documents` | → `DocumentRecord{id, title, format, language, artifact_ref, sha256, created_at, verify_url}[]` |
| GET | `/documents/{id}/download` | — |
| GET 🌐 | `/verify/{id}` | → `{title, issuer_name, created_at, provenance_summary, verifiers}` |
| POST 🌐 | `/verify/{id}` | multipart `file` → `{match: boolean}` |

## 13. Wallet and billing

| Method | Path | Body → Response |
|---|---|---|
| GET | `/me/wallet` | → `{balance, cap, threshold, low_balance_alert}` |
| PATCH | `/me/wallet` | `{cap?, threshold?, low_balance_alert?}` |
| POST | `/me/wallet/topups` | `{provider, amount: Money}` → `{topup_id, redirect_url?}` |
| GET | `/me/wallet/usage?cursor=` | → `UsageEvent{at, action, units, credits, run_id}[]` |
| GET 🌐 | `/prices` | → `PriceList{version, effective_from, items}` |
| POST | `/estimates` | `{action, params}` → `CostEstimate` |
| POST 🌐 | `/billing/webhooks/{provider}` | Signature-verified and idempotent |
| GET | `/me/wallet/receipts` | — |

## 14. Partner portal

| Method | Path | Body → Response |
|---|---|---|
| GET / POST | `/orgs/{slug}/calls` | Create a draft call |
| PUT | `/orgs/{slug}/calls/{id}/config` | Save a draft configuration |
| POST | `/orgs/{slug}/calls/{id}/publish` | → a new immutable `CallConfigVersion{version, sha256}` |
| POST | `/orgs/{slug}/calls/{id}/preview-score` | `{sample_proposal}` → `Evaluation` |
| GET | `/orgs/{slug}/ventures` | Consented ventures (mentors) |
| GET / POST | `/orgs/{slug}/members` | — |

## 15. Meta and connector

| Method | Path | Purpose |
|---|---|---|
| GET 🌐 | `/health` | Liveness |
| GET 🌐 | `/meta/languages` | Locales and their review status |
| GET | `/me/connectors` | List connector tokens |
| POST | `/me/connectors` | `{workspace_id, scopes}` → `{token}` (shown once) |
| DELETE | `/me/connectors/{id}` | Revoke |
| — | `/mcp` | The MCP server (streamable HTTP); see `connector.md` in C6 |
