# ADR-0011: Funder call configuration as versioned data

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Each funder has its own form, grid, gate, exclusions and declarations, and these change over time.

## Decision

`CallConfigVersion` is immutable JSON with a SHA-256 hash. A proposal pins the version current at creation. Rules are driven by the configuration.

## Consequences

Reproducible evaluations and auditability. A call builder UI is needed (partner portal).
