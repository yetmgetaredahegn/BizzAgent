# ADR-0007: Provenance model across all artifacts

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

The core promise is honesty: users and funders must see what is established and how.

## Decision

Every artifact field carries `Provenance{status, source, evidence, note}`. Statuses are `established`, `unverified`, `missing` and `contradictory`. Sources are `user_voice`, `user_text`, `user_document`, `workshop_photo`, `ledger`, `calculation`, `research`, `knowledge`, `assumption`, `remembered`, `imported`, `draft_for_approval` and `expert_review`. **The LLM is never a source.**

## Consequences

Evidence is visible everywhere (EvidenceStamp). There are more fields to persist, and a merge reducer is needed.
