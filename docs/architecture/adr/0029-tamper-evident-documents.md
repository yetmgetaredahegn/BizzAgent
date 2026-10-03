# ADR-0029: Tamper-evident documents: content hash and verification page

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Funders can't tell if an exported document was altered.

## Decision

Each export stores a SHA-256 hash and a `DocumentRecord`. The footer has a QR code and short link to a public verify page that compares a re-uploaded file's hash.

## Consequences

Verifiable documents. The verify page must leak nothing private.
