# Data model

> **What this is:** the persistent entities, their relationships and the tenancy rules.
> **Who reads it:** backend engineers.
> **Last reviewed:** 2026-10-03

The database is PostgreSQL ([ADR-0037](../architecture/adr/0037-postgresql-from-day-one.md)).
Each module owns one schema, named after it, and defines its tables with SQLAlchemy 2 in its own
`models.py` ([modules.md](../architecture/modules.md)). One Alembic history covers every module.
Infrastructure schemas:

| Schema | Tables | Owner |
|---|---|---|
| `platform` | `outbox`, `job_runs`, `alembic_version` | `core` |
| `langgraph` | Checkpoints and the Store (profile, memory, policies; pgvector index) | `modules.agents` |

**A module never reads another module's tables.** Relationships across schemas are id references
resolved through the owning module's public API. Foreign keys across schemas are allowed for
integrity (for example `org_id` → `accounts.organizations`).

```mermaid
erDiagram
  USER ||--|| PERSONAL_SPACE : owns
  USER ||--o{ MEMBERSHIP : has
  ORGANIZATION ||--o{ MEMBERSHIP : has
  ORGANIZATION ||--o{ ARTIFACT : owns
  ORGANIZATION ||--o{ CONSENT_GRANT : grants
  ORGANIZATION ||--o{ CALL : publishes
  CALL ||--o{ CALL_CONFIG_VERSION : versions
  ORGANIZATION ||--o{ PROPOSAL : prepares
  PROPOSAL }o--|| CALL_CONFIG_VERSION : pins
  PROPOSAL }o--o| DIRECTORY_ENTRY : targets
  PROPOSAL ||--o{ DECLARATION_EVENT : records
  PROPOSAL ||--o| SUBMISSION : becomes
  ORGANIZATION ||--o{ OPPORTUNITY : publishes
  ORGANIZATION ||--o{ PIPELINE_ITEM : tracks
  OPPORTUNITY ||--o{ PIPELINE_ITEM : in
  ORGANIZATION ||--o{ MISSION : runs
  MISSION ||--o{ INBOX_ITEM : raises
  ORGANIZATION ||--o{ ACTIVITY_EVENT : logs
  ORGANIZATION ||--o{ LEDGER_ENTRY : books
  ORGANIZATION ||--o{ DOCUMENT_RECORD : exports
  USER ||--|| WALLET : has
  WALLET ||--o{ CREDIT_ENTRY : moves
```

| Entity | Schema | Key fields | Notes |
|---|---|---|---|
| `User` | `accounts` | id, phone_hash, language, name, created_at | Phone stored hashed plus encrypted |
| `PersonalSpace` | `personal` | id, user_id | Reachable only through the owner's token |
| `Organization` | `accounts` | id, kind (`venture`\|`partner`), type, legal_form, partner_kind, name, slug, stage | `type` is one of explorer/team/business/collective/funder/program/support_org |
| `Membership` | `accounts` | org_id, user_id, role, authorised_signatory | Roles per [roles](../product/roles-and-permissions.md) |
| `Invitation` | `accounts` | org_id, phone_hash, role, consent?, expires_at | — |
| `ConsentGrant` | `accounts` | org_id, grantee_user_id, scope, artifact_ids, expires_at, revoked_at | Every access writes an `AuditEvent` |
| `Artifact` | `artifacts` | id, org_id, kind, version, payload JSON, fields JSON (with provenance), produced_by | Append-only versions |
| `MediaFile` | `artifacts` | id, org_id, kind, path, sha256, content_type, deleted_at | Stored outside the source tree |
| `Call` / `CallConfigVersion` | `funding` | call: org_id, title, status; version: call_id, version, config JSON, sha256 | Versions are immutable |
| `DirectoryEntry` | `funding` | id, name, url, instructions{lang}, verified_by | Off-platform funders |
| `Proposal` | `funding` | id, org_id, call_config_version_id \| directory_entry_id, artifact_id | — |
| `DeclarationEvent` | `funding` | proposal_id, declaration_id, kind (`understood`\|`ticked`), actor_user_id, actor_kind=`user`, language, at | Append-only; a `ticked` event must have `actor_kind=user` and a signatory |
| `Submission` | `funding` | proposal_id, channel (`platform`\|`export`), at | — |
| `Opportunity` | `opportunities` | id, type, title{lang}, provider_org_id \| directory_entry_id, url, deadline, rolling, benefit, eligibility JSON, languages, source JSON, status, last_checked_at, demo | — |
| `PipelineItem` | `opportunities` | id, org_id, opportunity_id, stage, checklist JSON | — |
| `Mission` | `agents` | id (= thread_id), org_id, goal, template, plan JSON, status, budget | — |
| `InboxItem` | `agents` | id, org_id, mission_id, type, payload, status, decided_by, via | — |
| `Policy` | `langgraph (Store)` | stored in the Store `("policies", org_id)` | — |
| `ActivityEvent` | `activity` | id, org_id, mission_id?, agent, action, sources JSON, credits, at | — |
| `LedgerEntry` | `money` | id, org_id, date, amount, currency, direction, category, counterparty, provenance JSON, import_id? | — |
| `PersonalBudget` / `Goal` / `PersonalAsset` | `personal` | personal_space_id, … | — |
| `JobOpening` / `Candidate` | `team` | org_id, …; candidate: no protected-attribute columns | — |
| `DocumentRecord` | `documents` | id, org_id, artifact_id, version, format, language, sha256, provenance_summary JSON | Public verify returns a safe subset |
| `PassportShare` | `trust` | id, org_id, token_hash, scope, expires_at, revoked_at | — |
| `Wallet` | `billing` | id, owner (user \| org), cap, threshold | Balance = sum of `CreditEntry` |
| `CreditEntry` | `billing` | id, txn_id, account, amount (+/−), at | Every `txn_id` sums to 0 |
| `PriceList` | `billing` | version, effective_from, items JSON | — |
| `UsageEvent` | `billing` | id, wallet_id, action, units, credits, run_id, price_list_version, status | — |
| `TopUp` | `billing` | id, wallet_id, provider, provider_event_id (unique), amount, status | — |
| `ConnectorToken` | `connector` | id, user_id, org_id, scopes, token_hash, revoked_at | — |
| `AuditEvent` | `activity` | id, org_id?, actor, action, target, at, details | — |

## Tenancy rules

- Every org-owned table has `org_id NOT NULL`.
- Each module's `repository.py` takes an `OrgScope(org_id, user_id, capabilities)` from `core`.
  There is **no unscoped query** in the request path.
- Personal-space tables live in the `personal` schema, keyed by `personal_space_id`. Only the
  `bizzagent_personal` database role can read them, and only `modules.personal` connects with
  that role.
- Before external organisations: PostgreSQL row-level security on the same columns.
