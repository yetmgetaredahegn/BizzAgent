# ADR-0004: SQLite with the LangGraph SQLite checkpointer and store now, PostgreSQL later

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

We need durable threads and memory with zero ops during early development.

## Decision

Use SQLite for app tables, `SqliteSaver` and the SQLite store now, behind factories in `agents/checkpointer.py` and `db.py`. Move to PostgreSQL (PostgresSaver/Store + RLS) before onboarding external organisations.

## Consequences

Simple local dev. SQLite is single-writer, so production with external organisations requires the Postgres PR.
