# ADR-0015: Pluggable web-search provider

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Market research and opportunity discovery need web search; providers differ in cost and terms.

## Decision

A `SearchProvider` protocol with `none`, `fake` and hosted implementations. Results are cached with page snapshots and `retrieved_at`. With `none`, the user is asked instead.

## Consequences

Provider choice is configuration. Snapshots cost storage.
