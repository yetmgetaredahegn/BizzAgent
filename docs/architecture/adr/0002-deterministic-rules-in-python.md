# ADR-0002: Deterministic calculators and rules in Python

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Models make arithmetic and eligibility mistakes, and the current proposal rules live in TypeScript in the browser.

## Decision

All calculations (`bizzagent.calc`) and rules (`bizzagent.rules`) are pure Python with no LLM imports, enforced by an architecture test. The TS engine is ported with a parity test, then deleted in PR D.

## Consequences

Numbers are exact and explainable, with step traces. Rules need porting effort and a one-time fixture export from TS.
