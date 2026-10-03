# ADR-0022: Personal space privacy and personal/business separation

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Owners mix personal and business money; personal data must never leak to co-founders or admins.

## Decision

`PersonalSpace` is reachable only through the owning user's token. No workspace, partner or admin path can reach it. Only explicit aggregate shares are allowed.

## Consequences

Strong privacy. Support staff cannot debug personal-space data.
