# Dependency rules

> **What this is:** the import and dependency boundary rules for the BizzAgent backend. These rules
> are enforced by `import-linter` (`uv run lint-imports`) and by convention.
> **Who reads it:** every contributor. Violations break CI.
> **Last reviewed:** 2026-10-17

## 1. Layered dependency direction

```
core · shared · integrations   ←   platform modules   ←   product modules
```

The arrow means "may depend on". Reverse dependencies are forbidden.

## 2. Layer rules

### 2.1 `core/`, `shared/`, `integrations/` never import `modules`

These layers provide infrastructure. They must not depend on any business domain.

**Enforced by:** import-linter contract "core, shared and integrations never import modules".

### 2.2 Routers handle HTTP concerns, not business logic

`router.py` validates input, calls the module's service, and maps domain errors to HTTP
responses. It does not contain business rules, database queries, or LLM calls.

**Enforced by:** code review.

### 2.3 Application services coordinate use cases

`service.py` orchestrates: load from repository → apply rules → call integrations → emit
events → return results. It does not own HTTP concerns or persistence details.

**Enforced by:** code review.

### 2.4 Repositories own persistence access

`repository.py` contains all database queries. Every query must be org-scoped in the request
path. No unscoped query is allowed.

**Enforced by:** code review and test.

### 2.5 Integrations isolate external providers

`integrations/` holds technical adapters behind provider-neutral interfaces. An integration
never makes business decisions and never imports `bizzagent.modules`.

**Enforced by:** import-linter contract "core, shared and integrations never import modules".

### 2.6 Module internals are private

Other code imports a module only through its package root (`bizzagent.modules.funding`), never
`bizzagent.modules.funding.models` or `.service` or `.repository`.

**Enforced by:** import-linter `protected` contracts, one per module.

### 2.7 Cross-module communication uses public contracts

Modules talk to each other in two ways:

1. **Synchronous calls** to another module's public API (commands, queries, read models).
2. **Domain events** through the transactional outbox, for asynchronous reactions.

Modules must not share database tables or ORM models.

**Enforced by:** import-linter `protected` contracts and per-module database schemas.

### 2.8 No circular imports

If module A depends on module B, B must not depend on A. Use events for reverse communication.

**Enforced by:** import-linter and Python's own import machinery (circular imports fail).

### 2.9 No unnecessary abstraction layers

Do not create interfaces, abstract base classes, or adapter layers unless there is a concrete
second implementation or a testability need. Prefer simple functions over class hierarchies.

**Enforced by:** code review.

### 2.10 Application composition contains no product logic

`main.py` builds the FastAPI app, mounts routers, and registers skills. It does not contain
business rules, use-case logic, or data access.

**Enforced by:** code review.

### 2.11 Agent infrastructure does not own business rules

The agent runtime (`modules.agents`) provides graph infrastructure, the skill registry,
interrupts, verification and streaming. It never contains product-specific business rules.

**Enforced by:** import-linter contract "Platform modules and the agent runtime never import
product modules".

## 3. Pure-code rules

### 3.1 `calc` and `knowledge` are pure

These modules import no LLM framework, no LangGraph, and no integrations. They do no I/O
except reading static pack files.

### 3.2 Every module's `rules/` is pure

A `rules/` sub-package imports no LLM framework, no LangGraph, and no integrations. All data
enters as function arguments.

**Enforced by:** import-linter contract "Pure code imports no model frameworks or integrations".
When a module gains a `rules/` sub-package, it must be added to this contract in
`pyproject.toml`.

## 4. Platform vs product isolation

Platform modules (accounts, billing, calc, knowledge, artifacts, documents, memory, activity,
agents) and the agent runtime never import product modules (learn, start, plan, funding,
opportunities, trust, markets, money, team, personal).

Product skills register with the runtime through its skill registry (dependency inversion), not
through direct imports.

**Enforced by:** import-linter contract "Platform modules and the agent runtime never import
product modules".

## 5. Personal space isolation

Only `bizzagent.main` may import `bizzagent.modules.personal`. No other module has access. In
the database, the `personal` schema uses a separate database role.

**Enforced by:** import-linter contract "Only the app entry point imports the personal space".

## 6. Adding or modifying boundary rules

When a new module is created:

1. Add a `protected` import-linter contract in `pyproject.toml`.
2. If the module has `rules/`, add it to the "Pure code" forbidden-import contract.
3. Run `uv run lint-imports` to verify.

When a new integration is added:

1. Ensure it lives in `integrations/` and does not import `modules`.
2. Run `uv run lint-imports` to verify.

## 7. Future enforcement

Rules currently enforced only by convention (marked "code review" above) may gain automated
enforcement through additional linter contracts or custom checks as the codebase grows. The
rules themselves are authoritative regardless of enforcement mechanism.
