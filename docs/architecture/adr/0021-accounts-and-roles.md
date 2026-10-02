# ADR-0021: Accounts, workspace types and role-based capabilities

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Ventures range from a solo explorer to a PLC with shareholders; partners have their own roles.

## Decision

Five workspace types with legal forms, and 15 roles in three scopes. A pure capability matrix (`tenancy/permissions.py`) tested for every pair, a signatory flag, and consent grants.

## Consequences

Fine-grained, explainable access. Defaults must stay simple (owner only at the start).
