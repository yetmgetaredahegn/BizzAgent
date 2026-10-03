# ADR-0023: Fair hiring: rubric-based, job-related screening

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Screening by model can encode bias.

## Decision

Scoring is a deterministic rubric over job-related criteria. The model only extracts evidence quotes. Protected attributes are stripped before extraction and never scored. A human makes the decision.

## Consequences

Defensible screening. Rubric design effort is needed per role.
