# ADR-0001: LangGraph supervisor (concierge) with skill sub-graphs

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

BizzAgent covers many tasks (numbers, setup, research, funding, hiring…). One giant prompt or one flat graph would be untestable and would mix state across tasks.

## Decision

A **concierge** supervisor graph routes each turn to a **skill sub-graph** with its own private state. Skills return control with `Command(goto=..., graph=Command.PARENT)`. Missions orchestrate several skills with `Send`.

## Consequences

Each skill can be tested in isolation and evolves independently. The cost is more graph wiring and state-schema discipline (input/output schemas per sub-graph).
