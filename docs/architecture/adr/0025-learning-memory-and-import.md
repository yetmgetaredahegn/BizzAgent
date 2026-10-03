# ADR-0025: Learning memory with user confirmation, and AI-history import

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

An agent that learns is valuable, but silent memory is creepy and error-prone.

## Decision

Candidates are extracted per turn and confirmed by the user before storage. The import of other assistants' history produces candidates only (`imported`), and raw files are deleted.

## Consequences

Trustworthy memory. Learning is slower than silent capture.
