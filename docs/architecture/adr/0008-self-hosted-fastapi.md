# ADR-0008: Self-hosted FastAPI, not LangGraph Platform

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

LangGraph Platform adds managed deployment, but we need custom auth, tenancy, billing and Ethiopian payment rails.

## Decision

Graphs run inside our FastAPI app with our own checkpointer. A `langgraph.json` is kept so `langgraph dev` and Studio work locally.

## Consequences

Full control and no platform dependency. Features like Platform cron and double-texting are implemented by us (jobs CLI, per-thread lock).
