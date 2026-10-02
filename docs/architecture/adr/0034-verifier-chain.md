# ADR-0034: Verifier chain before user-visible output

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Models can produce ungrounded claims, wrong numbers or the wrong language.

## Decision

Grounding, rules, language and policy verifiers (deterministic first), then critics. Failure means a bounded revision, then an explicit "couldn't verify".

## Consequences

Fewer bad outputs reach users. Extra latency and cost per turn.
