# ADR-0024: Pay-as-you-go credit wallet with a double-entry ledger and payment adapters

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Users can't commit to subscriptions; usage varies widely.

## Decision

Credits in a wallet, a versioned price list, a usage event per action, charge on success, automatic refunds, caps, a double-entry `CreditLedger`, and `PaymentProvider` adapters (sandbox first).

## Consequences

Fair, transparent billing. Metering must be built into every graph.
