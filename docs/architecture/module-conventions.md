# Module conventions

> **What this is:** the authoritative reference for how a business module is structured inside the
> BizzAgent backend. Every module follows this layout.
> **Who reads it:** engineers adding or modifying a module.
> **Last reviewed:** 2026-10-17

## 1. Location

Every business capability lives in its own package under `backend/src/bizzagent/modules/<name>/`.
The package name is a short, lowercase, singular noun (`funding`, not `funding_module`).

## 2. Files inside a module

A module starts as a package with only `__init__.py` and **gains files only when it gets that
responsibility**. The file names are a shared convention — do not invent alternatives.

| File | Responsibility | Required? |
|---|---|---|
| `__init__.py` | The **public API**: the only import path for code outside this module. Exports stable commands, queries, read models and event contracts. Never exports ORM models or repositories. | Always |
| `router.py` | FastAPI routes. Thin: validate input, call the service, map domain errors to HTTP responses. Contains no business logic. | When the module exposes HTTP endpoints |
| `schemas.py` | Pydantic request and response models (camelCase aliases for the API contract). | When the module has an API or structured output |
| `models.py` | SQLAlchemy table definitions, in the module's own Postgres schema. | When the module owns database tables |
| `service.py` | Use cases — application-level orchestration. Coordinates repository, rules and integration calls. | When the module has use cases beyond simple CRUD |
| `repository.py` | Database queries. Every query must be org-scoped — no unscoped queries in the request path. | When the module reads or writes data |
| `dependencies.py` | FastAPI dependency functions. | When the module injects request-scoped resources |
| `exceptions.py` | Domain error classes. These are mapped to the API error shape in `router.py`. | When the module can raise domain-specific errors |
| `events.py` | Event contracts this module emits via the transactional outbox. | When the module emits domain events |
| `tasks.py` | Event handlers and scheduled jobs this module owns. | When the module reacts to events or has background work |
| `rules/` | A sub-package of **pure domain rules**. No LLM, LangChain, LangGraph or integration imports. No I/O except reading static pack files. | When the module has deterministic business rules |
| `agent/` | The skill graph (`state.py`, `graph.py`, `nodes.py`, `prompts/*.md`), registered with the agent runtime's skill registry. | When the module owns an agent skill |
| `tests/` | Unit and integration tests for this module. | When there is code to test |

## 3. Pure rules vs application services

**`rules/`** contains deterministic domain logic:

- Eligibility checks, scoring, validation
- Calculators that combine inputs into outputs
- Decision tables and rubrics

Rules must be **importable without side effects**. They never call the database, invoke an LLM,
or access external services. All data enters as function arguments.

**`service.py`** contains use cases — the glue:

- Load data from the repository
- Call rules to compute results
- Call integrations where needed
- Emit events via the outbox
- Return results

## 4. Public API (`__init__.py`)

The module's `__init__.py` exports only:

- **Commands**: functions or classes that cause mutations
- **Queries**: functions that return data
- **Read models**: Pydantic models for the data returned by queries
- **Event contracts**: Pydantic models for events other modules consume

It **never exports**:

- ORM model classes (internal to the module's persistence layer)
- Repository classes or functions
- Internal schemas used only within the module
- Service implementation details

Other code imports the module only through its package root:

```python
# Correct:
from bizzagent.modules.funding import submit_proposal, ProposalSummary

# Forbidden:
from bizzagent.modules.funding.service import submit_proposal
from bizzagent.modules.funding.models import ProposalTable
```

## 5. Where tests belong

Module tests go in `backend/tests/modules/<name>/`. Mirror the module structure:

```
tests/modules/funding/
    test_rules.py       # unit tests for rules/ (pure, no fixtures)
    test_service.py     # integration tests for use cases
    test_router.py      # API-level tests with TestClient
    conftest.py         # module-specific fixtures
```

Cross-cutting structural and boundary tests go in `backend/tests/`.

## 6. Adding a new module

1. Create the package: `backend/src/bizzagent/modules/<name>/__init__.py` with a docstring
   describing what the module owns.
2. Add a `protected` import-linter contract in `pyproject.toml` so that other code imports only
   the package root.
3. If the module has `rules/`, add them to the "Pure code" forbidden-import contract.
4. Add files (`router.py`, `models.py`, etc.) only as the module gains each responsibility.
5. Do not create empty files speculatively.
6. Update the module catalogue in `docs/architecture/modules.md`.

## 7. Naming conventions

- Package names: lowercase, singular (`funding`, not `fundings`)
- File names: the standard names listed above, no alternatives
- Class names: PascalCase
- Function and variable names: snake_case
- Schema aliases: camelCase (for the JSON API contract)
- Database schemas: match the module name
