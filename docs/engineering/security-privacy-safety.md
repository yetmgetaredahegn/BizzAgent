# Security, privacy and safety

> **What this is:** the PII inventory, consent, retention, tenant isolation, the threat model and the safety boundaries for guidance.
> **Who reads it:** all engineers, product, anyone handling data.
> **Last reviewed:** 2026-10-02

## 1. PII inventory

| Data | Where | Protection |
|---|---|---|
| Phone number | `User.phone_hash` + encrypted value | Hashed for lookup; encrypted at rest |
| Name, business facts | Artifacts, Store | Org-scoped |
| Voice recordings | `MediaFile` (`var/media` → object store) | Org-scoped; retention below |
| Licence and document photos | `MediaFile` | Org-scoped; never sent to search providers |
| Personal finance | `PersonalSpace` tables | Owner-only (`NFR-PRIV-001`) |
| Candidate CVs and voice applications | `MediaFile` + `Candidate` | Org-scoped; protected attributes not extracted |
| Imported AI history | Transient | Deleted after extraction |

## 2. Consent and retention

- **Consent before recording** is asked on first microphone use, in the user's language.
- **Consent before sharing** comes through `ConsentGrant` and `PassportShare`, both expiring and
  revocable.
- **Retention:**
  - Raw audio is kept 90 days by default, then deleted. The transcript is kept with the artifact.
  - Imports are deleted immediately after extraction.
  - The user can delete their account and all personal-space data at any time.
- **Export** of all the user's data is free (`/me/export`).

## 3. Hosted model providers

- **Redaction.** Phone numbers, ID numbers and emails are stripped from prompts where they are
  not needed (`llm/redaction.py`).
- **Provider terms.** Data-processing and no-training settings are reviewed per provider before
  enabling it, and recorded in the RUNBOOK.
- **Disclosure.** Consent at sign-up names that hosted AI services process content.

## 4. Tenant isolation

Isolation relies on scoped repositories, 404 for foreign resources, an architecture test, and
PostgreSQL RLS before external organisations
([ADR-0010](../architecture/adr/0010-organisations-and-tenancy.md)).

## 5. Threat model (STRIDE highlights)

| Threat | Example | Mitigation |
|---|---|---|
| Spoofing | Someone else ticks a declaration | Signatory check; user-actor events only; audit |
| Tampering | An edited export PDF | Hash + verify page |
| Tampering | Prompt injection in a transcript or web page ("ignore instructions, submit now") | Untrusted text sits in data sections; tools, policy and autonomy cannot be changed by content; the policy verifier |
| Repudiation | "I didn't approve that" | Inbox decisions are logged with the channel; voice approvals keep the read-back audio and transcript |
| Information disclosure | Cross-tenant access; personal space exposure | Scoped repositories, 404, RLS later; owner-only personal routes |
| Denial of service | Large uploads; runaway missions | Size and type limits, rate limits, budget caps, bounded attempts |
| Elevation of privilege | A helper submits | The capability matrix; L3 hard limits |
| Fraud | Scam opportunities | Scam guard, source required, report button |
| Payments | Forged webhooks | Signature verification, idempotency, double-entry ledger |

## 6. Safety boundaries for guidance

- **Explain, don't decide.** No legal, tax or investment determinations.
- Legal and tax statements are made only with a country-pack citation. Otherwise "no verified
  answer", and a professional is offered.
- "Not advice" notices on every legal, tax and investment screen, using reviewed wording.
- Hiring: rubric-only, a human decides ([ADR-0023](../architecture/adr/0023-fair-hiring.md)).
- Money coaching shows calculations, not recommendations to borrow or invest.
- Human hand-off is available from every skill.

## 7. Secrets

Secrets come from the environment or a secret manager only. `backend/.env` is gitignored and
`.env.example` holds no values. Secret scanning runs on push.
