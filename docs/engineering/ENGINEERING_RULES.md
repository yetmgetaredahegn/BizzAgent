# Engineering rules

> **What this is:** the rules every change follows: layering, honesty invariants, Python, LangGraph, TS/React, i18n, git and the definition of done.
> **Who reads it:** every contributor, human or AI assistant. [AGENTS.md](../../AGENTS.md) points here.
> **Last reviewed:** 2026-10-02

## 1. Layering

```
routes → services → agents (graphs) → calc | rules | knowledge | llm | speech | vision | search | exports
```

- Lower layers never import upper layers.
- **`calc`, `rules` and `knowledge` are pure.** No LLM, LangChain or LangGraph imports and no
  I/O except reading pack files. `tests/test_architecture.py` enforces this.
- Routes contain no business logic. They validate, call a service and map errors.
- Org-owned data is accessed only through scoped repositories
  ([data-model](data-model.md#tenancy-rules)).

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

- **Tooling:** Python 3.13, `uv`. `ruff` (lint and format, line length 100); `mypy` (strict on
  `calc`, `rules`, `knowledge`, `tenancy.permissions`, `agents.core.policy`).
- **Models:** Pydantic v2 at every boundary (API, LLM structured output, pack files).
- **Heavy imports** (torch, whisper, kokoro, easyocr, weasyprint, provider SDKs) go **inside
  functions**. Importing `bizzagent.main` must load none of them (a test checks this).
- **Configuration** comes only from `bizzagent.config.settings`. No `os.getenv` elsewhere.
  **No secrets in code or the repo.**
- **Errors:** raise domain errors in services; map them to the API error shape in routes.
- **Logging:** use `logging` with structured extras. No `print`.

## 4. LangGraph

- **Small nodes**, one responsibility each. Name them by verb (`ground_claims`, `ask_input`).
- **State** is JSON-serialisable (Pydantic or TypedDict of plain types). Never mutate state in
  place; return updates. Use reducers for lists (`operator.add` or a custom reducer).
- **Side effects before `interrupt()` re-run on resume.** Put them after the interrupt, or make
  them idempotent with a key.
- **Every LLM node** has a `RetryPolicy` and a deterministic fallback (a template or asking the
  user). Structured output only for extraction.
- **Prompts** live in `llm/prompts/<id>.md` and are versioned. The prompt id and version are
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

- [ ] Backend: `uv run ruff check && uv run ruff format --check && uv run mypy src && uv run pytest`
- [ ] Web: `npm run lint && npm test && npm run build`
- [ ] Tests for new behaviour; the honesty invariants still pass
- [ ] Docs updated in the same PR: SRS IDs, [traceability](../requirements/traceability.md),
      SAD, ADRs, [api.md](api.md), [ux-spec](../design/ux-spec.md)
- [ ] UI: screenshots at 390 and 1440, light and dark, one Ethiopic language; axe clean;
      anti-slop checklist
- [ ] No secrets, no real personal data in fixtures
