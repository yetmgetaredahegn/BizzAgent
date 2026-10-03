# ADR-0019: Opportunity catalogue: sources, freshness, verification and scam policy

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Opportunities are scattered, stale or fraudulent.

## Decision

There are three sources: platform, curated (URL + verifier) and discovered (URL + snapshot; status `discovered`). Grounding checks apply to deadline, amount and eligibility. Expired listings are hidden. A pure scam guard flags with reasons.

## Consequences

No invented listings. Discovery yield is lower than a naive scrape.
