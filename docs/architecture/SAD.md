# BizzAgent — Software Architecture Document

> **What this is:** the architecture, following arc42 with C4 diagrams: context, containers, components, runtime sequences, deployment, cross-cutting concerns, quality, risks.
> **Who reads it:** engineers and reviewers. Read the [LangGraph primer](../onboarding/LANGGRAPH_PRIMER.md) alongside it.
> **Last reviewed:** 2026-10-03

Decisions are in [`adr/`](adr/). The skills are detailed in [agents.md](agents.md); the agentic
runtime is in [agent-operating-model.md](agent-operating-model.md).

## 1. Goals and constraints

**Quality goals, in priority order:**

1. **Honesty:** no fabricated facts, and provenance on every value.
2. **Language access:** am, om and en, with voice everywhere.
3. **Safety and privacy:** tenant isolation, a private personal space, consent.
4. **Recoverability:** durable threads and resumable missions.
5. **Changeability:** skills, countries, providers and channels are pluggable.

**Constraints:**

- Python 3.13 with FastAPI and LangGraph 1.2.x; Next.js 16 for the web.
- A modular monolith: one deployable, split into domain modules
  ([ADR-0036](adr/0036-modular-monolith.md), [modules.md](modules.md)).
- PostgreSQL only, one schema per module ([ADR-0037](adr/0037-postgresql-from-day-one.md)).
- Hosted model APIs in production, Ollama in development, fakes in CI.
- No secrets in the repo.

## 2. Context (C4 level 1)

```mermaid
flowchart LR
  V[Venture users<br/>explorer · team · business · collective] -->|web, voice| BA((BizzAgent))
  P[Partner users<br/>funder · program · support_org] -->|partner portal| BA
  AI[ChatGPT / Claude / other MCP clients] -->|MCP connector| BA
  BA --> LLM[Hosted LLM APIs<br/>per role]
  BA --> SP[Speech APIs / local Whisper, MMS, Kokoro]
  BA --> SR[Search provider]
  BA --> PAY[Payment gateways]
  BA --> CH[Telegram / WhatsApp / IVR<br/>later]
```

## 3. Containers (C4 level 2)

```mermaid
flowchart TB
  subgraph Browser
    WEB[Next.js web client<br/>web/]
  end
  subgraph Server["One codebase: bizzagent"]
    API[API process<br/>FastAPI, module routers, graphs, SSE]
    WRK[Worker process<br/>bizzagent worker: outbox + scheduled jobs]
    MCP[MCP server<br/>modules.connector]
  end
  PG[(PostgreSQL<br/>one schema per module<br/>platform: outbox, job_runs<br/>langgraph: checkpoints, store)]
  MEDIA[(Media storage<br/>var/media → object store)]
  WEB -->|REST + SSE /v1| API
  MCP --> API
  API --> PG
  WRK --> PG
  API --> MEDIA
```

The API writes domain rows and outbox events in one transaction; the worker delivers the events
to the subscribing modules and runs scheduled watchers
([ADR-0038](adr/0038-transactional-outbox-and-worker.md)).

## 4. Components (C4 level 3, package `bizzagent`)

The package is a modular monolith. The full catalogue (what each module owns, its schema, public
API, events and skills) is in [modules.md](modules.md); the rules are in
[ENGINEERING_RULES §1](../engineering/ENGINEERING_RULES.md#1-modules-and-boundaries).

| Area | Contents |
|---|---|
| `core/` | Config, database, security, errors, event bus + outbox, tenancy scope, logging |
| `integrations/` | Technical adapters: LLM roles, speech, vision, search, payments, storage |
| `shared/` | Provenance, value types (Money, DualDate), i18n helpers |
| Platform modules | `accounts`, `billing`, `calc` (pure), `knowledge` (pure core), `artifacts`, `documents`, `memory`, `activity`, `agents` (the agent runtime: concierge, missions, inbox, policy, verifiers, skill registry) |
| Product modules | `learn`, `start`, `plan`, `funding`, `opportunities`, `trust`, `markets`, `money`, `team`, `personal`; each owns its skill graph in `agent/` |
| Edge | `connector` (MCP) |
| `legacy/interview` | The old interview loop; deleted when `modules.funding` lands (C3) |

**Dependency direction:** product modules → platform modules → `core` / `shared` /
`integrations`. Modules use each other only through their package root. `import-linter` enforces
this.

## 5. Runtime views

### 5.1 First contact and language choice

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as API
  participant G as Concierge graph
  participant S as Store
  U->>W: open app
  W->>A: POST /v1/conversations
  A->>G: invoke(thread_id)
  G->>S: get ("users", id) profile
  S-->>G: no language
  G-->>A: interrupt(choose_language, options am/om/en + audio)
  A-->>W: prompt
  U->>W: "Afaan Oromoo" (voice)
  W->>A: POST /turns (audio)
  A->>G: Command(resume=audio)
  G->>G: transcribe → intent=language(om)
  G->>S: put profile.language=om
  G-->>W: next prompt in om (text + audio)
```

### 5.2 Voice turn with read-back

`voice_io.listen` (ASR for the language) → `extract` → `readback` interrupt ("Did you say 8
employees?") → on "yes", write to the artifact with provenance `user_voice` → `speak`.

### 5.3 Handoff: concierge → skill → back

The intent router returns `numbers` → the numbers sub-graph runs → it finishes with
`Command(goto="summarise", graph=Command.PARENT, update={...})` → the concierge summarises and
speaks.

### 5.4 Language switch mid-skill

`PUT /v1/conversations/{id}/language` → `graph.update_state(config, {"language": "am"},
as_node="set_language")` → the pending interrupt prompt is re-phrased from its locale key, not
re-generated.

### 5.5 Numbers question with a calculation trace

The numbers skill fills its slots through interrupts → `ToolNode` calls `calc.margins.gross_margin`
→ the `Result.steps` are rendered as a ReceiptTape in the user's language → a `FinancialSheet`
artifact is saved → the rules verifier checks that every number shown equals `Result.value`.

### 5.6 Legal question: cited, or refused for lack of a source

Setup skill → `knowledge.retrieve(country="et", topic=...)`.

- **Entries found:** the answer is grounded to the entry ids, with a citation per paragraph.
- **No entries:** a template says "I don't have a verified source" and offers an advisor.

The grounding verifier rejects any paragraph that has no `knowledge(entry_id)` source.

### 5.7 Market research map-reduce

`plan_queries` → `Send("analyst", {...})` per competitor or segment, split into global and
local → each analyst runs `search` → extract facts with URL + `retrieved_at` → `reduce`:
dedupe, SWOT, price table, localisation gap → `MarketReport`.

### 5.8 Opportunity discovery → match → pipeline → proposal

1. Scout: profile snapshot → `Send` per (type, source) → collect → dedupe.
2. Eligibility (pure) → rank (pure) → explain fit (grounded) → the user picks (interrupt).
3. Add to the pipeline with a requirements checklist → hand off to the funding skill.

### 5.9 Watcher job refresh and reminder

The `deadline_reminders` job (owned by `modules.opportunities`):

1. Select pipeline items whose deadline is within N days and that have no reminder sent for that
   window.
2. Create an inbox item and a notification.
3. Record the run in `platform.job_runs`.

The worker runs it on schedule ([ADR-0038](adr/0038-transactional-outbox-and-worker.md)). A re-run
is a no-op.

### 5.10 Market-entry plan

`choose_target` → research (`Send`) → `confirm_indicators` (read-back) → `attractiveness`
(pure) → `entry_mode` (rules) → `cost_to_enter` (calc) → `requirements` (cited or TODO) →
`MarketEntryPlan` + DOCX.

### 5.11 Proposal submit: on-platform vs export

- **Finalize** checks the invariants: declarations ticked by the user actor, drafts approved, no
  open blocking gaps (or an explicit acknowledgement).
- **Inbox approval card:**
  - On-platform: a `Submission` row, visible to that funder's reviewers.
  - Directory entry: an export, plus a `DocumentRecord` with hash and QR code.

### 5.12 Crash and resume

The process dies mid-mission. On restart, a new graph instance is compiled with the same
`PostgresSaver`. A job or event calls `graph.invoke(Command(resume=...), config={"thread_id":
mission_id})`. Execution continues from the last checkpoint. Side effects run after interrupts or
are idempotent.

## 6. Graph overview

```mermaid
flowchart TD
  START --> greet{language known?}
  greet -->|no| choose((interrupt: choose language))
  choose --> understand
  greet -->|yes| understand
  understand[voice_io + intents + trim/summarise] --> route{intent router}
  route --> numbers[[numbers]] & setup[[setup]] & idea[[idea]] & market[[market]] & funding[[funding]] & opp[[scout]] & more[[… other skills]]
  route --> mission[[mission executor]]
  route --> reply[direct answer / honest I-don't-know]
  numbers & setup & idea & market & funding & opp & more & mission --> verify[verifier chain]
  verify --> summarise[summarise · update artifacts · memory candidates]
  reply --> verify
  summarise --> speak[voice_io: TTS] --> wait((interrupt: next turn)) --> understand
```

## 7. Deployment

| Environment | Models | Speech | Data | Notes |
|---|---|---|---|---|
| CI | `fake` per role | fake | PostgreSQL service container, fresh database per run | No network; fake search |
| Local dev | Ollama models per role | local Whisper / Kokoro (extras) | PostgreSQL 17 + pgvector via `docker compose up -d db` | `langgraph dev` for Studio |
| Production | Hosted APIs per role, with fallbacks | Hosted speech where it supports am/om (verified per provider), else local | Managed PostgreSQL + object storage; API and worker processes | Keys from a secret manager; RLS before external organisations |

## 8. Cross-cutting concepts

- **Provenance.** [ADR-0007](adr/0007-provenance-model.md). It is carried on every artifact field
  and every document.
- **Configuration.**
  - Process settings come from `Settings`.
  - Run settings come from `context_schema=RuntimeContext`: org, country pack, enabled
    languages, the call configuration in the funding skill, and the autonomy policy.
- **Retries and fallbacks.** Every LLM node has a `RetryPolicy` and a deterministic fallback
  (template or ask the user). Each model role has `with_fallbacks`.
- **Streaming.** `stream_mode=["updates","custom"]`. Stage events come from `get_stream_writer()`
  and are relayed over SSE. The activity log consumes the same events.
- **Safety.** Untrusted input (transcripts, web pages, documents) is wrapped and never treated as
  instructions; see [security](../engineering/security-privacy-safety.md).
- **Logging.** Structured JSON with `run_id`, `thread_id`, skill, model per role, tokens and
  latency.
- **Idempotency.** Webhooks, jobs, outbox handlers and post-interrupt side effects are keyed.

## 9. Architecture decisions

The ADR list is in [adr/README.md](adr/README.md).

## 10. Quality scenarios

| Scenario | Response | Measure |
|---|---|---|
| The model outputs Amharic text in Latin script | The language guard fails and a template fallback is used | 100% caught in tests |
| The model invents a tax threshold | The grounding verifier finds no pack source and removes the claim | 0 fabricated facts on the golden set |
| A foreign org requests an artifact | The scoped repository returns nothing | 404, tested |
| A server crash during a mission | Resume from the checkpoint | Mission completes; tested |
| A duplicate payment webhook | Ledger idempotency key | One credit; tested |
| The hosted model is down | Role fallback model, else a deterministic template | Turn still completes |

## 11. Risks and technical debt

| Risk | Mitigation |
|---|---|
| Legal/tax content wrong or stale | Citations required, `verified:false` until reviewed, `review_due`, advisor hand-off |
| Hallucinated competitors or opportunities | URL-or-drop, grounding check, page snapshots |
| Hosted-model cost, latency and outages | Per-role models, fallbacks, timeouts, caching, metering |
| PII sent to model APIs | Consent, redaction, provider terms reviewed |
| Dev/prod model quality gap | Evals against the production model set before release |
| Oromo ASR gap | MMS spike; text input always available |
| Cross-tenant leak | Scoped repositories, tests, RLS before external organisations |
| Modules tangle over time | Public package roots only, import-linter in CI, a schema per module |
| Lost or duplicated reactions between modules | Transactional outbox, leases, idempotent handlers, dead-event runbook |
| Over-autonomous agent | Conservative defaults, approvals, hard L3 exclusions, budgets, activity log |
| Docs drift | Docs are authoritative and updated in the same PR |

**Known debt:**

- The web TS rules engine duplicates `modules.funding.rules` until it is ported (C3).
- `legacy/interview` and `routes/applications.py` remain until `modules.funding` lands (C3).
