# Runbook

> **What this is:** operating BizzAgent: configuration, jobs, providers, incidents.
> **Who reads it:** whoever runs an environment.
> **Last reviewed:** 2026-10-03

## Configuration

- All settings are `BIZZAGENT_*` environment variables (see `backend/.env.example`). Production
  secrets come from the secret manager, never from files in the repo.
- `BIZZAGENT_ENV` is `dev`, `test` or `prod`. It selects the model map per role
  ([ADR-0006](../architecture/adr/0006-pluggable-llm-per-role.md)).

## Running (from C1)

Two processes from the same code, both connected to PostgreSQL (`BIZZAGENT_DATABASE_URL`):

```bash
cd backend && uv run alembic upgrade head
uv run uvicorn bizzagent.main:app --host 0.0.0.0 --port 8000   # API
uv run bizzagent worker                                        # outbox + scheduled jobs
```

Run more than one worker for throughput; they share work through `FOR UPDATE SKIP LOCKED`
([ADR-0038](../architecture/adr/0038-transactional-outbox-and-worker.md)).

## Jobs and events

- **Scheduled jobs** (`deadline_reminders`, `opportunity_watch`, `weekly_checkin`,
  `ledger_anomaly`) run inside the worker. Each run is recorded in `platform.job_runs`. Running a
  job twice is a no-op. Run one by hand with `uv run bizzagent jobs run <name>`.
- **Outbox events** move `pending → processing → completed`. Failures retry with backoff; after
  the maximum attempts an event becomes `dead`.

### Dead events

1. List them: `SELECT id, type, attempts, last_error FROM platform.outbox WHERE status = 'dead';`
2. Fix the cause (handler bug, provider outage).
3. Re-queue: `UPDATE platform.outbox SET status = 'pending', attempts = 0, next_attempt_at = now()
   WHERE id = '<id>';` Handlers are idempotent, so a re-run is safe.

## Providers checklist (before enabling one)

| Provider | Before enabling |
|---|---|
| Hosted LLM | Data-processing terms and a no-training setting recorded; keys in the secret manager; fallbacks configured |
| Speech | am/om word error rate measured on recorded samples and recorded in LANGUAGE_SUPPORT §5 |
| Search | Terms of service allow the use; rate limits configured |
| Payments | Sandbox tested; webhook secret set; idempotency verified |

## Incidents

| Symptom | First check |
|---|---|
| Turns fail for one language | Language guard fallback rate; provider status for that role |
| Missions stuck "running" | Worker running; dead events in `platform.outbox`; pending interrupts in the inbox |
| Credits charged on failure | `usage_events` with `status=failed`; run the refund job; file a bug (this breaks an invariant) |
| Cross-tenant data reported | Treat as a security incident: revoke tokens, audit `activity.audit_events`, notify |
