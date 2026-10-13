# Roadmap

> **What this is:** the order in which BizzAgent is built, as a stack of pull requests.
> **Who reads it:** everyone planning work.
> **Last reviewed:** 2026-10-02

Build order: **docs → frontend prototype → backend → wiring.** Every PR updates the docs it
changes. A PR that diverges from the docs without updating them is not done.

| PR | Branch | Scope | Status |
|---|---|---|---|
| A | `feat/web-client` | Next.js web client (proposal intake and reviewer dashboard) | open |
| A2 | `chore/repo-cleanup` | Rename to BizzAgent, src layout, remove Streamlit and the original funder branding | open |
| B | `docs/product-architecture` | This documentation set | in progress |
| F | `feat/web-prototype` | Clickable prototype of every screen on a typed mock client, new identity | next |
| A3 | `chore/agent-scaffold` | Modular-monolith package tree, import-linter boundaries, architecture docs on PostgreSQL, light theme default | in progress |
| C1 | `feat/platform-core` | PostgreSQL + Alembic + outbox worker; `core`; modules `accounts`, `billing`, `calc`, `knowledge`, `artifacts`; proposal rules; i18n; CI | |
| C2 | `feat/agent-runtime` | LangGraph concierge, voice, language routing, onboarding interview, memory, missions, inbox, verifiers | |
| C3 | `feat/skills` | Numbers, setup, launch readiness, idea, market, document explainer, funding, exports | |
| C4 | `feat/opportunities-and-markets` | Opportunity scout, accelerator coach, market entry, journey planner, Common Application, Passport, readiness | |
| C5 | `feat/team-money-growth` | Hiring, money coach (business + personal), growth coach, watchers | |
| C6 | `feat/passport-and-connector` | Statement import, MCP connector | |
| D | `feat/web-api` | Web client on API v1; delete the TS rules engine and legacy backend | |

Each PR's base is retargeted when the PR below it merges. Work stops after each PR for review.

**Proposed change ([ADR-0035](../architecture/adr/0035-contract-first-and-vertical-slices.md)):**
each C PR also switches its own screens from the mock to the HTTP client, using a per-domain
switch in `web/src/api/mode.ts`. PR D then only deletes the mock, the TS rules engine and the
legacy backend. C2 splits into C2a (runtime, `ask.py`, concierge, Numbers end to end over SSE)
and C2b (missions, inbox, policy, verifiers).

## Later

1. `feat/funder-portal`: call builder with preview scoring, reviewer graph, overrides with an
   audit trail, invites.
2. `feat/speech-am-om`: MMS ASR/TTS after a word-error-rate spike on recorded samples.
3. Channels: `feat/channels-telegram`, then WhatsApp, then IVR/USSD.
4. The features in [feature catalog §3](feature-catalog.md#3-designed-now-built-later-priority-order),
   in order.
5. `feat/program-portal`: incubators, accelerators and hackathon organisers receive applications
   on-platform.
6. `feat/postgres-rls`: row-level security on `org_id` (PostgreSQL itself arrives in C1,
   [ADR-0037](../architecture/adr/0037-postgresql-from-day-one.md)). **Required before any
   external organisation is onboarded.**
