# ADR-0036: A modular monolith with domain-owned skills

- **Status:** Accepted
- **Date:** 2026-10-03

## Context

The architecture described a horizontally layered package (`routes → services → agents → calc |
rules | …`). With about 20 business domains and 13 skills, layers spread each feature across the
whole tree, and nothing stops one domain from reading another's tables. Microservices would cost
too much for a small team. The agent runtime would also become a "god module" if every skill graph
lived inside it.

## Decision

1. **One deployable, split by domain.** Code lives in `bizzagent/modules/<name>/`, one package per
   domain, listed in [modules.md](../modules.md). Shared infrastructure lives in `core/`, outside
   adapters in `integrations/`, and small value types in `shared/`.
2. **Standard module files**, created only when needed: `router`, `schemas`, `models`, `service`,
   `repository`, `dependencies`, `exceptions`, `events`, `tasks`, plus `rules/` (pure) and
   `agent/` (skill graph).
3. **Public API.** A module's `__init__.py` exports only stable commands, queries, read models and
   event contracts. ORM models and repositories are never exported.
4. **Integrations are technical adapters** behind interfaces, with no business decisions. For
   example, `modules.billing` owns top-ups and charging, and calls the `PaymentProvider`
   interface whose Chapa and Telebirr adapters live in `integrations.payments`.
5. **The agent runtime is a platform module; skills belong to their domains.** `modules.agents`
   holds the runtime, concierge, missions, inbox, verifiers and `ask`. Each product module keeps
   its skill graph and prompts in `agent/` and registers it with the runtime's skill registry.
   The runtime never imports a product module.
6. **Cross-module communication** is a call to another module's public API, or a domain event
   through the outbox ([ADR-0038](0038-transactional-outbox-and-worker.md)).
7. **The personal space is isolated twice.** Only `bizzagent.main` may import
   `modules.personal`, and its Postgres schema is granted to a separate role
   ([ADR-0037](0037-postgresql-from-day-one.md)).
8. **import-linter enforces the boundaries** (`uv run lint-imports`, part of the definition of
   done). It replaces the hand-written `test_architecture.py` import checks.

## Consequences

- A feature usually touches one module, so PRs stay small and ownership is clear.
- A domain can later be split out as a service along an existing boundary.
- Cross-module needs must go through a public API or an event, which costs some extra code.
- The web mirrors module names only in `web/src/api/http/<module>.ts`; screens are unchanged.
