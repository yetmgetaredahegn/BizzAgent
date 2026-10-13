# Testing and evaluation

> **What this is:** the test layers, fakes, honesty invariants and the model evaluation suite.
> **Who reads it:** all engineers.
> **Last reviewed:** 2026-10-03

## 1. Layers

| Layer | Where | Runs in CI | Notes |
|---|---|---|---|
| Module | `backend/tests/modules/<module>/` | yes | Each module's unit, graph and API tests. Pure code: hand-computed expectations and `hypothesis` property tests |
| Core and shared | `backend/tests/{core,shared}/` | yes | Config, logging, outbox, i18n helpers |
| Parity | `backend/tests/modules/funding/test_parity.py` | yes | Python rules vs fixtures exported from the TS engine |
| Graph | `backend/tests/modules/<module>/test_<skill>.py` | yes | Fake providers; drive interrupts with `Command(resume=…)` |
| API | `backend/tests/modules/<module>/test_api.py` | yes | `TestClient`; tenant isolation (a foreign org gets 404) |
| Cross-module | `backend/tests/integration/` | yes | Flows across modules, including outbox delivery and handler idempotency |
| Boundaries | `uv run lint-imports` | yes | Module boundaries and purity ([ADR-0036](../architecture/adr/0036-modular-monolith.md)) |
| Startup | `backend/tests/test_api.py` | yes | No heavy imports when `bizzagent.main` loads |
| Web unit | `web/src/**/*.test.ts` (vitest) | yes | — |
| Web E2E | `web/e2e/*.spec.ts` (Playwright) | yes (PR F onward) | Personas × 3 languages at 390 and 1440; screenshots; axe |
| Evals | `backend/evals/` (`make eval`) | **no** | Against configured hosted models or Ollama |

## 2. Fakes

`Deps.fake()` (from `modules.agents`) provides:

- `FakeChatModel`: scripted structured outputs keyed by prompt id
- `FakeASR`: maps an audio fixture name to a transcript
- `FakeTTS`
- `FakeOCR`
- `FakeSearch`: fixture pages with snapshots
- `FakePaymentProvider`
- an in-memory Store and checkpointer, for graph unit tests

CI never calls a network model. Tests that touch the database run against PostgreSQL (a service
container in CI, `docker compose up -d db` locally), with a fresh database per run.

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

## 5. Responsive and visual checks (web)

Playwright runs every prototype screen at these viewports:

| Viewport | Class |
|---|---|
| 320 × 640 | compact |
| 360 × 740 | phone |
| 390 × 844 | phone (design size) |
| 768 × 1024 | tablet |
| 1024 × 768 | laptop |
| 1440 × 900 | desktop |
| 1920 × 1080 | wide |
| 844 × 390 | landscape phone |

Each run asserts: **no horizontal page scroll** (`scrollWidth <= clientWidth`), every control has a
target of at least 44 × 44 px on `pointer: coarse` viewports, and the layout holds at 200% text
size. It also runs axe, and stores screenshots for light and dark and for one Ethiopic language.

## 6. What is not tested in CI

- Hosted model APIs
- Real Ollama, Whisper or Kokoro
- Real web search
- Real payment gateways

PRs state this explicitly when they touch those areas.
