# Runbook

> **What this is:** operating BizzAgent: configuration, jobs, providers, incidents.
> **Who reads it:** whoever runs an environment.
> **Last reviewed:** 2026-10-02

## Configuration

- All settings are `BIZZAGENT_*` environment variables (see `backend/.env.example`). Production
  secrets come from the secret manager, never from files in the repo.
- `BIZZAGENT_ENV` is `dev`, `test` or `prod`. It selects the model map per role
  ([ADR-0006](../architecture/adr/0006-pluggable-llm-per-role.md)).

## Running

```bash
cd backend && uv run uvicorn bizzagent.main:app --host 0.0.0.0 --port 8000
```

## Jobs (from C4)

Idempotent; schedule with cron or a hosted scheduler:

```cron
# m h dom mon dow  command
7 * * * *   cd /srv/bizzagent/backend && uv run bizzagent jobs run deadline_reminders
17 3 * * *  cd /srv/bizzagent/backend && uv run bizzagent jobs run opportunity_watch
27 6 * * 1  cd /srv/bizzagent/backend && uv run bizzagent jobs run weekly_checkin
```

Each run is recorded in `audit_events`. Running a job twice is a no-op.

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
| Missions stuck "running" | Checkpointer health; pending interrupts in the inbox; job scheduler |
| Credits charged on failure | `usage_events` with `status=failed`; run the refund job; file a bug (this breaks an invariant) |
| Cross-tenant data reported | Treat as a security incident: revoke tokens, audit `audit_events`, notify |
