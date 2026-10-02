# ADR-0027: Frontend-first prototype on a typed mock client

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

The product is large; the user needs to see it before backend investment.

## Decision

PR F builds every screen against a `BizzAgentApi` TypeScript interface with a `mockClient`. PR D swaps in `httpClient`, with OpenAPI types checked against `contract.ts`.

## Consequences

Early feedback and a contract-first API. Mock and backend can drift, so they are checked in D.
