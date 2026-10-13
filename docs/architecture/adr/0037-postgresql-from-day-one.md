# ADR-0037: PostgreSQL from day one, one schema per module

- **Status:** Accepted
- **Date:** 2026-10-03
- **Supersedes:** [ADR-0004](0004-sqlite-now-postgres-later.md)

## Context

ADR-0004 chose SQLite first and PostgreSQL before external organisations. SQLite is
single-writer, while the API, the worker, SSE streams and LangGraph checkpoints write
concurrently. Schemas per module, row-level security, pgvector for semantic memory and
`FOR UPDATE SKIP LOCKED` for the outbox all need PostgreSQL. Migrating later would mean rewriting
migrations, the checkpointer and tests.

## Decision

1. **PostgreSQL is the only database** in development, CI and production. SQLite is removed from
   the code, the configuration and the docs.
2. **Development** runs PostgreSQL 17 with pgvector through `docker compose up -d db`. **CI** uses
   a PostgreSQL service container. Tests use a fresh database per run.
3. **One schema per module**, named after it (`accounts`, `funding`, …). Infrastructure schemas:
   `platform` (`outbox`, `job_runs`, `alembic_version`) and `langgraph` (checkpoints and the
   Store).
4. **The `personal` schema** is granted only to the `bizzagent_personal` role. Only
   `modules.personal` connects with that role, so the main app role cannot read it, even with raw
   SQL.
5. **LangGraph** uses `PostgresSaver` and `PostgresStore` (pgvector index for memory).
6. **One Alembic history** loads every module's models, so migrations keep a single order.
   Settings use `BIZZAGENT_DATABASE_URL`.
7. Row-level security on `org_id` is still added before any external organisation is onboarded.

## Consequences

- No database migration later; behaviour in development matches production.
- Contributors need Docker (or a local PostgreSQL) to run the backend and its tests.
- Table ownership is visible in the database, not only in the code.
