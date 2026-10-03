# Country knowledge packs

> **What this is:** the format, sourcing, verification and staleness rules for the legal, tax and market knowledge BizzAgent is allowed to state.
> **Who reads it:** content reviewers, engineers working on `bizzagent.knowledge`, anyone adding a fact.
> **Last reviewed:** 2026-10-02

Decision: [ADR-0014](../architecture/adr/0014-country-knowledge-packs.md). Requirements:
`FR-KNW-*`, `FR-SET-003`, `FR-LCH-001`, `FR-MKE-002`.

## 1. The rule

**BizzAgent may state a legal, tax, regulatory or market-requirement fact only if it comes from a
pack entry with a source.** If no entry exists, it says it has no verified answer and offers a
professional. A figure with no source is written as `TODO(source needed)`, never as a number.

## 2. Entry format

Entries live in `backend/knowledge/<country>/<topic>/<id>.yaml`:

```yaml
id: et.legal_forms.overview
country: et
topic: legal_forms
title: { en: "...", am: "...", om: "..." }
body:  { en: "...", am: "...", om: "..." }   # plain language; am/om reviewed separately
sources:
  - url: "https://<official source>"
    title: "<document title>"
    retrieved_at: "2026-10-02"
    excerpt: "<the sentence the body relies on>"
verified: false          # true only after a content_reviewer signs off
verified_by: null        # reviewer id
valid_from: null         # date the rule took effect, if known
review_due: "2027-04-01" # re-check date
applies_to:              # optional filters used by rules and retrieval
  legal_forms: [plc, one_member_plc]
  sectors: []
```

## 3. Sourcing

- **Preferred sources:**
  - official government portals and gazettes
  - the text of proclamations and regulations
  - official registry and authority pages
  - international bodies for trade rules
- **Not acceptable as the only source:** blogs, forums, model output, or "common knowledge".
- Proclamation numbers, fees, thresholds and rates **must** be quoted in `excerpt`.

## 4. Verification and staleness

- Entries start with `verified: false`. They are retrievable in development, and in production
  shown with an "unverified source" note.
- A `content_reviewer` verifies an entry against the source and sets `verified_by`.
- Past `review_due`, answers show "may be out of date" and the entry is queued for review.
- `bizzagent knowledge validate` (in CI) checks:
  - the schema
  - at least one source with a URL and `retrieved_at`
  - `verified_by` present when `verified: true`
  - no numeric claim in `body` without a matching number in an `excerpt`

## 5. Target-market packs

Market entry needs requirements for target markets. Stubs exist so requirements have a home:

- `knowledge/ke/`: Kenya (example stub)
- `knowledge/eu-import/`: importing into the EU (example stub)

Stubs contain only TODO entries until they are researched.

## 6. Ethiopia coverage

See [ethiopia/README.md](ethiopia/README.md).
