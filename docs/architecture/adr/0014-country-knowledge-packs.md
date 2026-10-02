# ADR-0014: Country knowledge packs with citations and verification

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Legal and tax facts change and differ by country; invented facts are the biggest risk.

## Decision

YAML entries in `backend/knowledge/<country>/` with sources (URL, title, `retrieved_at`), `verified`, `verified_by`, `valid_from` and `review_due`. A validator runs in CI. Unsourced figures are written as `TODO(source needed)`.

## Consequences

Trustworthy answers. Coverage grows only as fast as human verification.
