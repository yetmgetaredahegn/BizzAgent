# ADR-0010: Organisations and tenancy (shared schema, org_id)

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Ventures, funders, programmes and support organisations share one platform.

## Decision

Shared database. Every org-owned row has an `org_id`; access goes only through repositories that require an `OrgScope`, plus API dependencies. A foreign org gets 404. PostgreSQL RLS is added before external organisations are onboarded.

## Consequences

Simple schema. Isolation depends on discipline until RLS, so architecture tests enforce it.
