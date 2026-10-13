# Engineering rules

> **What this is:** the rules every change follows: modules and boundaries, honesty invariants, Python, LangGraph, TS/React, i18n, git and the definition of done.
> **Who reads it:** every contributor, human or AI assistant. [AGENTS.md](../../AGENTS.md) points here.
> **Last reviewed:** 2026-10-03

## 1. Modules and boundaries

The backend is a **modular monolith** ([ADR-0036](../architecture/adr/0036-modular-monolith.md)).
Each business domain is a package under `bizzagent/modules/`; the catalogue and each module's
responsibilities are in [modules.md](../architecture/modules.md).

```
core · shared · integrations   ←   platform modules (incl. the agent runtime)   ←   product modules
```

- **Put code in the module that owns the domain.** A module gains `router`, `schemas`, `models`,
  `service`, `repository`, `events`, `tasks`, `rules/` or `agent/` only when it needs them.
- **Import another module only through its package root** (`bizzagent.modules.funding`). Its
  `__init__.py` exports stable commands, queries, read models and event contracts, never ORM
  models or repositories.
- **`core`, `shared` and `integrations` never import `modules`.** Integrations are technical
  adapters with no business decisions.
- **Platform modules and the agent runtime never import product modules.** Skills register with
  the runtime's skill registry.
- **Pure code stays pure.** `calc`, `knowledge` and every `rules/` import no LLM, LangChain,
  LangGraph or integrations, and do no I/O except reading pack files.
- **Only `bizzagent.main` imports `modules.personal`.**
- **Talk across modules** by calling a public API, or by emitting a domain event through the
  outbox ([ADR-0038](../architecture/adr/0038-transactional-outbox-and-worker.md)).
- **Routes contain no business logic.** They validate, call the module's service and map errors.
- **Org-owned data** is read only through the module's scoped repository
  ([data-model](data-model.md#tenancy-rules)).
- `uv run lint-imports` enforces these rules (contracts in `backend/pyproject.toml`).

## 2. Honesty and safety invariants (each has a named test)

| Invariant | Test |
|---|---|
| The LLM is never a provenance source | `test_llm_is_never_a_source` |
| A value without a source is not shown as fact | `test_unsourced_value_not_established` |
| Numbers shown come only from `calc` results | `test_numbers_only_from_calc` |
| A legal claim requires a pack citation | `test_legal_claim_requires_citation` |
| A research fact requires a URL | `test_research_fact_requires_url` |
| Contradictions keep both values | `test_contradiction_keeps_both_values` |
| Only users tick declarations | `test_user_only_ticks_declarations` |
| A remembered fact needs read-back before a document | `test_remembered_fact_needs_readback` |
| An opportunity requires a source | `test_opportunity_requires_source` |
| Expired opportunities are never suggested | `test_no_expired_suggestions` |
| Translations are labelled | `test_translations_labelled` |
| L3 never signs, submits, pays or touches the personal space | `test_l3_hard_limits` |
| No charge on failure | `test_no_charge_on_failure` |
| Protected attributes never reach the scorer | `test_protected_attributes_stripped` |

## 3. Python

- **Tooling:** Python 3.13, `uv`. `ruff` (lint and format, line length 100); `import-linter`;
  `mypy` (strict on `modules.calc`, `modules.knowledge`, every `rules/`, the accounts capability
  matrix and the agents autonomy policy).
- **Models:** Pydantic v2 at every boundary (API, LLM structured output, pack files).
- **Heavy imports** (torch, whisper, kokoro, easyocr, weasyprint, provider SDKs) go **inside
  functions**. Importing `bizzagent.main` must load none of them (a test checks this).
- **Configuration** comes only from the settings object (`bizzagent.config`, moving to
  `core/config.py` in C1). No `os.getenv` elsewhere.
  **No secrets in code or the repo.**
- **Errors:** raise the module's domain errors (`exceptions.py`) in services; map them to the
  API error shape in its router.
- **Database:** PostgreSQL only, one schema per module ([ADR-0037](../architecture/adr/0037-postgresql-from-day-one.md)).
  A module never reads another module's tables.
- **Logging:** use `logging` with structured extras. No `print`.

## 4. LangGraph

- **Small nodes**, one responsibility each. Name them by verb (`ground_claims`, `ask_input`).
- **State** is JSON-serialisable (Pydantic or TypedDict of plain types). Never mutate state in
  place; return updates. Use reducers for lists (`operator.add` or a custom reducer).
- **Side effects before `interrupt()` re-run on resume.** Put them after the interrupt, or make
  them idempotent with a key.
- **Every LLM node** has a `RetryPolicy` and a deterministic fallback (a template or asking the
  user). Structured output only for extraction.
- **Prompts** live next to their agent: `modules/<name>/agent/prompts/<id>.md`, or
  `modules/agents/prompts/` for the runtime. They are versioned. The prompt id and version are
  logged.
- **Untrusted text** (transcripts, pages, documents) goes in clearly delimited data sections. It
  never changes tools, policy or autonomy.
- **Always pass `thread_id`.** Sub-graphs have explicit input and output schemas.
- **Use the 1.x APIs:** `interrupt()` + `Command(resume=…)`, `Command(goto=…, graph=Command.PARENT)`,
  `Send`, `get_stream_writer()`, `context_schema`. Not `interrupt_before` or `NodeInterrupt`.

## 5. TypeScript and React

- **Next.js 16 App Router.** Server components by default; add `"use client"` only where needed.
- **React 19 compiler rules.** No manual memo unless measured. Use `useSyncExternalStore` for
  browser stores. No `setState` in effects for derived values.
- **Styling:** use `cn()` (clsx + tailwind-merge), tokens only (no raw hex), and Lucide icons.
- **API access** goes only through `web/src/api` (`BizzAgentApi`). No `fetch` in components.
- **Strings** come only from locale files.

## 6. i18n

No hard-coded user-facing strings. Every new key gets en + am + om; am and om are drafts until
reviewed ([workflow](../i18n/translation-workflow.md)).

## 7. Git

- **Branches:** `feat/…`, `fix/…`, `docs/…`, `chore/…`, `refactor/…`, `test/…`.
- **Commits:** Conventional Commits, imperative mood, with a body explaining *why*. Make small
  logical commits.
- **The human is the author.** No AI co-author trailers, "generated with" lines or session links
  in commits or PRs.
- **PRs** use the [template](../../.github/pull_request_template.md), are stacked where planned,
  and show screenshots for UI.

## 8. Definition of done

- [ ] Backend: `uv run ruff check && uv run ruff format --check && uv run mypy src && uv run lint-imports && uv run pytest`
- [ ] Web: `npm run lint && npm test && npm run build`
- [ ] Tests for new behaviour; the honesty invariants still pass
- [ ] Docs updated in the same PR: SRS IDs, [traceability](../requirements/traceability.md),
      SAD, [modules](../architecture/modules.md), ADRs, [api.md](api.md), [ux-spec](../design/ux-spec.md)
- [ ] UI: screenshots at 390 and 1440, light and dark, one Ethiopic language; axe clean;
      anti-slop checklist
- [ ] No secrets, no real personal data in fixtures
