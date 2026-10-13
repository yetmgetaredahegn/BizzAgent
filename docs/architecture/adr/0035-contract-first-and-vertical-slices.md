# ADR-0035: The web contract is the API source of truth; the backend lands in vertical slices

- **Status:** Proposed
- **Date:** 2026-10-03

## Context

PR F built every screen on `web/src/api/contract.ts`. [api.md](../../engineering/api.md) was
written earlier and differs from it:

| Topic | `contract.ts` | `api.md` |
|---|---|---|
| Naming | camelCase | snake_case |
| Text | `Msg{id, vars}` locale keys | Localised strings |
| Conversation | `sendEvent` returns a `Conversation` snapshot | Turns returning a `Prompt` |
| Pending kinds | ask · readback · cost · choice | question · readback · choice · approval · info |
| Autonomy | `0–3` | `"L0"–"L3"` |

The roadmap also wires the web to the backend only at the end (PR D). ADR-0027 names the risk
of that: the mock and the backend drift apart while C1–C6 are built.

Two runtime details also need a home:

- Locale strings live only in `web/src/i18n/messages`, but the backend needs them for TTS, the
  language guard and re-phrasing a pending prompt from its key.
- A side effect before `interrupt()` re-runs on resume, so an inbox card written there would be
  duplicated.

## Decision

1. **`contract.ts` is the source of truth.** Pydantic models use camelCase aliases. Templated
   text is returned as `Msg`; model-written replies add a separate `text` field. `api.md` is
   updated to match, and `web/scripts/gen-api-types.mjs` generates `web/src/api/generated/` from
   OpenAPI so CI can diff it against `contract.ts`.
2. **Conversations map one-to-one onto interrupts.** Each `Pending.kind` is an interrupt payload
   from `modules.agents` (`ask`, `readback`, `approve`); each `ConversationEvent` is a
   `Command(resume=…)`. `undo` uses time travel and never goes back past a charged action.
   Progress messages and tokens stream over SSE.
3. **`ask()` reads the run context.** In a conversation it becomes the pending prompt; inside a
   mission it becomes an inbox question card. A skill is written once and works both ways.
4. **Inbox writes are idempotent**, upserted on `(thread_id, interrupt_id)`
   (`modules.agents`).
5. **One locale catalog.** `locales/{en,am,om}.json` at the repo root is read by both the web and
   the backend. The web catalogs move there gradually.
6. **Vertical slices.** `web/src/api/mode.ts` selects mock or http **per domain**. Each C PR
   implements its backend modules ([modules.md](../modules.md)) and switches its screens to
   http in the same PR. PR D shrinks to deleting the mock, the TS rules engine and the legacy
   backend.

## Consequences

- The mock and the API cannot drift silently; every PR proves its slice end to end.
- The legacy applicant flow (`lib/api.ts`, `components/funding/intake-screen.tsx`,
  `interview-screen.tsx`, `backend/.../legacy/`, `routes/applications.py`) stays until the
  funding module (C3) replaces it.
- The TS rules engine (`lib/evaluate.ts`, `gaps.ts`, `contradictions.ts`, `resolve.ts`) is
  ported to `bizzagent.modules.funding.rules`, and its vitest cases are reused as golden vectors.
- `api.md` needs a rewrite pass in C1.
