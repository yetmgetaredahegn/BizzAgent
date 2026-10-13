# ADR-0020: Background jobs via a CLI, cron-friendly

- **Status:** Accepted; amended by [ADR-0038](0038-transactional-outbox-and-worker.md) (jobs run in the worker; runs are recorded in `platform.job_runs`)
- **Date:** 2026-10-02

## Context

Watchers and reminders need scheduling; LangGraph cron is Platform-only.

## Decision

`bizzagent jobs run <name>` runs idempotent jobs, records each run in `audit_events`, and is scheduled by cron or a hosted scheduler.

## Consequences

Simple and portable. Scheduling infrastructure lives outside the app.
