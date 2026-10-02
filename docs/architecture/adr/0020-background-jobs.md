# ADR-0020: Background jobs via a CLI, cron-friendly

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Watchers and reminders need scheduling; LangGraph cron is Platform-only.

## Decision

`bizzagent jobs run <name>` runs idempotent jobs, records each run in `audit_events`, and is scheduled by cron or a hosted scheduler.

## Consequences

Simple and portable. Scheduling infrastructure lives outside the app.
