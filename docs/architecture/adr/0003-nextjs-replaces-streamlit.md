# ADR-0003: Next.js web client replaces Streamlit

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Streamlit was a developer harness; the product needs a responsive, accessible, multi-screen client.

## Decision

`web/` (Next.js 16, App Router, Tailwind v4) is the only client. The Streamlit harness was removed in A2.

## Consequences

There is one UI codebase. The TS types must be kept in sync with the API (OpenAPI-generated types in D).
