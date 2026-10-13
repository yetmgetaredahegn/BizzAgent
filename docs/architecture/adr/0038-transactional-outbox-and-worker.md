# ADR-0038: Transactional outbox and a PostgreSQL-backed worker

- **Status:** Accepted
- **Date:** 2026-10-03
- **Amends:** [ADR-0020](0020-background-jobs.md)

## Context

Modules react to each other's changes: a submitted proposal resumes a mission, logs activity and
charges credits. Doing that inline couples modules and loses work if the process dies. A message
broker such as Redis adds another system to run. PostgreSQL is already required
([ADR-0037](0037-postgresql-from-day-one.md)).

## Decision

1. **Outbox.** A service writes its rows and an event row to `platform.outbox` in the **same
   transaction**. An event is never published for a change that rolled back.
2. **Event row:** `id`, `type`, `payload`, `status`, `attempts`, `next_attempt_at`,
   `locked_until`, `last_error`, `created_at`.
3. **Lifecycle:** `pending → processing → completed`.
   - On a handler error the row returns to `pending` with exponential backoff.
   - After the maximum number of attempts it becomes `dead`. The [RUNBOOK](../../ops/RUNBOOK.md)
     covers inspecting and re-queuing it.
4. **Worker.** `bizzagent worker` claims due rows with `FOR UPDATE SKIP LOCKED` and sets a lease
   (`locked_until`). A row whose lease expired can be reclaimed, so several workers can run.
5. **Handlers** live in the subscribing module's `tasks.py`. They are idempotent and keyed by
   `(event_id, handler)`.
6. **Scheduled jobs** (watchers from ADR-0020) run in the same worker and are recorded in
   `platform.job_runs`. `bizzagent jobs run <name>` still runs one job by hand.
7. **Scope:** durable business and background work only. Realtime traffic (SSE, tokens, stage
   events) stays in the API process and is not routed through the outbox.

## Consequences

- Reactions survive crashes and are retried; modules stay decoupled.
- No broker to operate. If throughput ever outgrows PostgreSQL, the outbox can feed a broker
  without changing the modules.
- Handlers must be written to run more than once safely.
