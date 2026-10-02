# Testing and evaluation

> **What this is:** the test layers, fakes, honesty invariants and the model evaluation suite.
> **Who reads it:** all engineers.
> **Last reviewed:** 2026-10-02

## 1. Layers

| Layer | Where | Runs in CI | Notes |
|---|---|---|---|
| Unit (pure) | `backend/tests/{calc,rules,knowledge,i18n,tenancy}` | yes | Hand-computed expectations; `hypothesis` property tests for calc invariants |
| Parity | `backend/tests/rules/test_parity.py` | yes | Python rules vs fixtures exported from the TS engine |
| Graph | `backend/tests/agents/**` | yes | Fake providers; drive interrupts with `Command(resume=…)` |
| API | `backend/tests/api/**` | yes | `TestClient`; tenant isolation (a foreign org gets 404) |
| Architecture | `backend/tests/test_architecture.py` | yes | Import rules; no heavy imports at startup |
| Web unit | `web/src/**/*.test.ts` (vitest) | yes | — |
| Web E2E | `web/e2e/*.spec.ts` (Playwright) | yes (PR F onward) | Personas × 3 languages at 390 and 1440; screenshots; axe |
| Evals | `backend/evals/` (`make eval`) | **no** | Against configured hosted models or Ollama |

## 2. Fakes

`bizzagent.agents.deps.Deps.fake()` provides:

- `FakeChatModel`: scripted structured outputs keyed by prompt id
- `FakeASR`: maps an audio fixture name to a transcript
- `FakeTTS`
- `FakeOCR`
- `FakeSearch`: fixture pages with snapshots
- `FakePaymentProvider`
- an in-memory Store and checkpointer

CI never calls a network model.

## 3. Honesty invariants

These are the named tests listed in
[ENGINEERING_RULES §2](ENGINEERING_RULES.md#2-honesty-and-safety-invariants-each-has-a-named-test).
They live in `backend/tests/invariants/` and run on every PR.

## 4. Evals (`make eval`)

- **Golden conversations** in am, om and en per skill, under `backend/evals/golden/<skill>/*.yaml`.
  Each holds inputs, expected artifact fields with provenance, and forbidden claims.
- **Metrics:**

  | Metric | Target |
  |---|---|
  | Fabricated facts | **0** |
  | Citation coverage | ≥ 98% |
  | Language-guard pass rate | — |
  | Calc correctness | 100% |
  | Gap recall | — |
  | Contradiction recall | — |
  | Intent accuracy per language | — |

- They run against the **production model set** before a release; development models are only
  indicative.
- Results are written to `backend/evals/results/<date>.json` (gitignored) and summarised in the
  release PR.

## 5. What is not tested in CI

- Hosted model APIs
- Real Ollama, Whisper or Kokoro
- Real web search
- Real payment gateways

PRs state this explicitly when they touch those areas.
