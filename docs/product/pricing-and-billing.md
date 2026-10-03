# Pricing and billing: pay-as-you-go

> **What this is:** how users pay. Wallet, credits, top-up, metering, honest billing rules.
> **Who reads it:** product, engineers working on `bizzagent.billing`, finance.
> **Last reviewed:** 2026-10-02

Decision record: [ADR-0024](../architecture/adr/0024-credit-wallet.md). Requirements: `FR-BIL-*` in
the [SRS](../requirements/SRS.md).

## 1. Model

- **No subscriptions.** Users top up a **wallet** in **credits** and pay per use.
- Credits are priced in ETB, with a USD equivalent for international users. The exchange rate is
  configuration, not hard-coded.
- A workspace can have a **shared wallet** funded by its owner. Members spend within per-member
  caps.
- **Starter credits** on sign-up. **Learning basics are always free.**
- Partners (funders and programmes) also top up. They pay per published opportunity and per
  reviewed application.

## 2. Top-up

- `PaymentProvider` adapters:
  - Ethiopian gateways (candidates: Chapa, telebirr)
  - an international card processor (candidate: Stripe)
  - a `FakeProvider` for development and CI
- **Sandbox first.** Each provider's API, fees and terms are verified before integration; this
  document makes no claim about them.
- Webhooks are signature-verified and idempotent (keyed by the provider event id). Each one is
  recorded in the double-entry `CreditLedger`.

## 3. Metering

Every billable action emits `UsageEvent{action, units, credits, run_id, price_list_version}`
against a **versioned `PriceList`**.

| Action | Unit |
|---|---|
| Conversation turn | Provider-reported tokens (prompt + completion) × price per model tier |
| Voice | Per minute of ASR / TTS |
| Document explain | Per page |
| Research run | Per source fetched |
| Export | Per document |
| Opportunity watch | Per week |
| Proposal submission | Per submission |
| Connector (MCP) call | Per call, by tool |
| Partner: publish opportunity | Per opportunity |
| Partner: review application | Per application |

Concrete credit prices are set in the price list by an admin. **No prices are fixed in these
docs.**

## 4. Honest billing rules (each one is a test)

| Rule | Test |
|---|---|
| A **CostTicket estimate** is shown, and confirmation asked, before any action above the user's threshold | `test_estimate_before_paid_action` |
| **Charge on success only.** A failed run is never charged | `test_no_charge_on_failure` |
| **Automatic refund** if a charged run is later rolled back | `test_refund_on_rollback` |
| **The spending cap is never exceeded**; a mission halts at its cap | `test_cap_halts_mission` |
| **Free actions stay free**: learning basics, viewing your own data, exporting your own data, deleting the account | `test_free_actions_not_metered` |
| The **ledger balances to zero** (double entry) | `test_ledger_balances` |
| A **duplicate webhook** credits once | `test_webhook_idempotent` |
| An **itemised history** exists per action | API contract |

## 5. Ledger

The ledger uses double-entry accounts:

| Account | Holds |
|---|---|
| `user_wallet:{id}` | A user's credits |
| `workspace_wallet:{id}` | A shared workspace wallet |
| `revenue` | Credits spent on actions |
| `promotions` | Starter credits |
| `refunds` | Refunded credits |
| `payment_clearing:{provider}` | Top-ups in flight from each provider |

Every movement is a balanced pair of entries. A balance is the sum of its entries; it is never
stored as a mutable number.

## 6. Admin

- A versioned price-list editor, refunds with a reason, and receipts.
- The billing views live in the platform admin. `platform_admin` only.
