# Modules

> **What this is:** the module catalogue of the BizzAgent backend, a modular monolith. For each module: what it owns, its Postgres schema, its public API, the events it emits and handles, its skills, and the PR that builds it.
> **Who reads it:** backend engineers, and anyone deciding where new code goes.
> **Last reviewed:** 2026-10-03

Decisions: [ADR-0036](adr/0036-modular-monolith.md) (modules and boundaries),
[ADR-0037](adr/0037-postgresql-from-day-one.md) (database),
[ADR-0038](adr/0038-transactional-outbox-and-worker.md) (events and the worker).

## 1. Shape

```
backend/src/bizzagent/
  main.py          builds the app, mounts each module's router, registers skills
  cli.py           `bizzagent worker`, `bizzagent jobs run <name>`
  core/            config · database · security · errors · events (bus + outbox) · tenancy · logging
  integrations/    technical adapters: llm · speech · vision · search · payments · storage
  shared/          provenance · types (Money, DualDate) · i18n helpers
  modules/         one package per business domain (below)
```

| Folder | Holds | Never holds |
|---|---|---|
| `core/` | Infrastructure every module needs | Business rules; imports of `modules` |
| `integrations/` | Adapters to outside services, behind interfaces (`PaymentProvider`, `SearchProvider`, model roles) | Business decisions, prompts, imports of `modules` |
| `shared/` | Small value types and helpers with no I/O | Anything owned by one domain |
| `modules/<name>/` | Everything about one domain: API, use cases, tables, rules, skill graph | Another module's internals |

## 2. Inside a module

A module starts as a package and **gains files only when it gets that responsibility**. The
names are the common FastAPI convention:

| File | Holds |
|---|---|
| `__init__.py` | The **public API**: the only import path for other code |
| `router.py` | FastAPI routes. Thin: validate, call the service, map errors |
| `schemas.py` | Pydantic request and response models (camelCase aliases, [ADR-0035](adr/0035-contract-first-and-vertical-slices.md)) |
| `models.py` | SQLAlchemy tables, in the module's Postgres schema |
| `service.py` | Use cases |
| `repository.py` | Org-scoped queries. No unscoped query in the request path |
| `dependencies.py` | FastAPI dependencies |
| `exceptions.py` | Domain errors (mapped to the API error shape in `router.py`) |
| `events.py` | Event contracts this module emits |
| `tasks.py` | Event handlers and scheduled jobs this module owns |
| `rules/` | Pure domain rules: no LLM, LangChain, LangGraph or integrations |
| `agent/` | The skill graph (`state.py`, `graph.py`, `nodes.py`, `prompts/*.md`), registered with the agent runtime |

**The public API** (`__init__.py`) exports only stable commands, queries, read models and event
contracts. ORM models, repositories and internal schemas are never exported.

## 3. Boundaries (checked by `uv run lint-imports`)

1. `core`, `shared` and `integrations` never import `modules`.
2. Other code imports a module only through its package root (`bizzagent.modules.funding`),
   never `…funding.models` or `…funding.service`.
3. Platform modules and the agent runtime never import product modules. Product skills plug
   into the runtime through its skill registry (dependency inversion).
4. `calc`, `knowledge` and every `rules/` package import no LangChain, LangGraph or
   integrations.
5. Only `bizzagent.main` imports `modules.personal`. In Postgres, the `personal` schema is
   granted only to a separate role used by that module's engine.

Modules talk in two ways:

- **Calls** to another module's public API, for queries and commands that need an answer now.
- **Domain events** through the transactional outbox, for reactions: the activity log, resuming
  a mission, charging credits, reminders ([ADR-0038](adr/0038-transactional-outbox-and-worker.md)).

## 4. Catalogue

**Platform modules** may be used by any module. **Product modules** may call each other's public
APIs and the platform modules.

### Platform

| Module | Owns | Schema | Skills | PR |
|---|---|---|---|---|
| `accounts` | Users, workspaces, members, roles, the capability matrix, invitations, consent grants, auth tokens | `accounts` | — | C1 |
| `billing` | Wallet, double-entry credit ledger, price list, estimates, usage, top-ups, `charge_on_success`; uses `integrations.payments` | `billing` | — | C1 |
| `calc` | Pure calculators returning `Result{value, steps, inputs_used, warnings}`; `/calcs` | — (pure) | — | C1 |
| `knowledge` | Country packs, retrieval, citations; `/knowledge` | `knowledge` (index only) | — | C1 |
| `artifacts` | Versioned artifacts with field provenance | `artifacts` | — | C1 |
| `activity` | Activity log and audit events, fed by domain events; export | `activity` | — | C2b |
| `memory` | Memory items, candidates, read-back, AI-history import | `memory` + LangGraph Store | — | C2a |
| `agents` | **Runtime only:** graph runtime, skill registry, run context, checkpointer, `ask` / `readback` / `approve`, streaming, per-thread locks, verifier chain, concierge, voice I/O, onboarding interview, missions, inbox, autonomy policy, standing instructions, journey planner; routes for conversations, missions, inbox, autonomy and policies | `agents` | Concierge, onboarding | C2a, C2b |
| `documents` | Exports (DOCX, PDF, XLSX, JSON), SHA-256, `DocumentRecord`, public verify | `documents` | — | C3 |

### Product

| Module | Owns | Schema | Skills (`agent/`) | PR |
|---|---|---|---|---|
| `learn` | Glossary, learn mode | `learn` | Document explainer | C3 |
| `start` | Setup rules (`rules/`), registration checklists | `start` | Business setup, launch readiness | C3 |
| `plan` | Idea canvases, validation plans, evidence board, market reports | `plan` | Idea clarifier and validation, market research | C3 |
| `funding` | Funders, calls and immutable config versions, directory, proposals, declarations, submissions, partner review and overrides; proposal rules (`rules/`) | `funding` | Funding proposal | C3 |
| `opportunities` | Catalogue, sources, dedupe, eligibility, ranking, scam guard, pipeline | `opportunities` | Opportunity scout, accelerator and investor coach | C4 |
| `trust` | Readiness score, Common Application, Business Passport and shares | `trust` | — | C4 |
| `markets` | Market-entry plans | `markets` | Market entry | C4 |
| `money` | Business ledger, statement import, statements, KPIs | `money` | Numbers coach, money coach (business), growth coach | C3 (numbers), C5 |
| `team` | Job openings, candidates (no protected attributes), screening | `team` | Hiring | C5 |
| `personal` | Private personal space: budget, goals, net worth, owner's pay | `personal` (own role) | Money coach (personal) | C5 |

### Edge

| Module | Owns | Schema | PR |
|---|---|---|---|
| `connector` | Connector tokens and the MCP server, which calls other modules' public APIs. Never the personal space | `connector` | C6 |

## 5. Infrastructure schemas

| Schema | Holds | Owner |
|---|---|---|
| `platform` | `outbox`, `job_runs`, `alembic_version` | `core` |
| `langgraph` | Checkpoints and the Store (pgvector index) | `modules.agents` via `core` |

## 6. Where today's code moves

The legacy code stays where it is until the module that replaces it lands.

| Today | Destination | When |
|---|---|---|
| `legacy/interview/` | Deleted; replaced by `modules.agents` onboarding + `modules.funding` skill | C3 |
| `routes/applications.py`, `schemas/` | `modules.funding` (router, schemas) | C3 |
| `vision/licence_check.py` | `integrations.vision` + `modules.funding` checks | C3 |
| `speech/asr.py`, `speech/tts.py` | `integrations.speech` | C2a |
| `storage/uploads.py` | `integrations.storage` | C1 |
| `config.py` | `core/config.py` | C1 |
