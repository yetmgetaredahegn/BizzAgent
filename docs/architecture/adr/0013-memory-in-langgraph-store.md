# ADR-0013: Profile and business memory in the LangGraph Store

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Memory must persist across threads and support semantic recall.

## Decision

Use the Store namespaces `("users", id)`, `("business", workspace_id)` and `("policies", workspace_id)`, with a semantic index using the `embed` role model.

## Consequences

One mechanism for memory and policies. Store migrations need care when moving to Postgres.
