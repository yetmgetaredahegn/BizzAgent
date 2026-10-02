# Accounts, workspace types and roles

> **What this is:** registration, workspace types and legal forms, the 15 roles, the capability matrix, consent and the signatory rule.
> **Who reads it:** product, design (onboarding and Team screens), engineers working on `bizzagent.tenancy`.
> **Last reviewed:** 2026-10-02

Decision records: [ADR-0021](../architecture/adr/0021-accounts-and-roles.md),
[ADR-0022](../architecture/adr/0022-personal-space-privacy.md).

## 1. Registration flow

1. **Choose a language** by tap or voice. Each option has an audio sample.
2. **Phone number.** OTP later; a token for now.
3. **"What brings you here?"** chooses the workspace path (§2).
4. **Onboarding interview.** 5–10 minutes, voice or text, adaptive, skippable at any point.
   Every answer is read back.
5. Optional: **"Bring your context"** from Claude, ChatGPT or Gemini
   ([memory](../architecture/memory-and-learning.md#4-ai-history-import)).
6. **Home** with three real next actions and starter credits. Never an empty dashboard.

## 2. Workspace types and legal forms

Every person gets an account and a **private personal space**. They can create or join any
number of workspaces.

| "What brings you here?" | Workspace `type` | `legal_form` | Typical stage |
|---|---|---|---|
| "I'm exploring / I have an idea" | `explorer` | — | idea |
| "We're a team building something" | `team` | — (not yet registered) | idea / validated |
| "I run a business" | `business` | `informal` · `sole_proprietorship` · `one_member_plc` · `plc` · `share_company` · `general_partnership` · `limited_partnership` · `other` | operating / growing |
| "I run a cooperative, association or non-profit" | `collective` | `cooperative` · `association_cso` · `ngo` · `savings_group` | operating |
| "I fund or support businesses" | `partner` | partner kind: `funder` · `program` · `support_org` | — |

The legal form drives country-pack content, required documents, signatory rules and proposal
eligibility. Converting a workspace (for example `team` → `one_member_plc`) is a guided
business-setup flow that writes an audit event.

> The meaning of each legal form under Ethiopian law comes from the country pack, with
> citations. This document only names the options.

## 3. Roles (15 in 3 scopes)

| Scope | Role | Purpose |
|---|---|---|
| Venture workspace | `owner` | Full control, members, deletion; legal representative by default |
| | `co_founder` | Full edit including finances and the cap table; cannot delete the workspace or remove the owner |
| | `manager` | Runs operations: artifacts, ledger, hiring, proposals; no ownership or cap-table changes |
| | `finance` | Ledger, statements, payroll, exports; read access to the rest |
| | `member` | Assigned tasks, own ledger entries, read access to assigned artifacts |
| | `helper` | Acts for the owner with explicit consent (for example a family member); scoped, audited, time-limited |
| | `advisor` | External, from a support org. Reads and comments on shared artifacts; consented and time-limited |
| | `viewer` | External (investor or funder data room). Read-only on explicitly shared artifacts |
| Partner org | `org_admin` | Members, settings, branding |
| | `program_manager` | Publishes opportunities and calls (versioned configurations) |
| | `reviewer` | Reviews applications for that organisation only |
| | `mentor` | Coaches assigned ventures with their consent |
| Platform | `platform_admin` | Operations, price list, refunds |
| | `content_reviewer` | Verifies knowledge-pack entries and translations (`verified_by`) |
| | `moderator` | Curates opportunities, handles scam reports |

Defaults: a new workspace has only its `owner`. The invite flow suggests a role and explains it
in plain language.

## 4. Capability matrix (venture workspace)

✓ = allowed. **S** = only on artifacts explicitly shared through a consent grant. **A** = only on
assigned items.

| Capability | owner | co_founder | manager | finance | member | helper | advisor | viewer |
|---|---|---|---|---|---|---|---|---|
| `manage_members` | ✓ | ✓¹ | | | | | | |
| `edit_profile` | ✓ | ✓ | ✓ | | | ✓ | | |
| `edit_legal_and_cap_table` | ✓ | ✓ | | | | | | |
| `view_finances` | ✓ | ✓ | ✓ | ✓ | | ✓ | S | S |
| `edit_finances` | ✓ | ✓ | ✓ | ✓ | A | ✓ | | |
| `run_payroll` | ✓ | ✓ | | ✓ | | | | |
| `manage_hiring` | ✓ | ✓ | ✓ | | | | | |
| `edit_artifacts` | ✓ | ✓ | ✓ | ✓ | A | ✓ | | |
| `submit_and_sign` | ✓² | ✓² | | | | | | |
| `share_externally` | ✓ | ✓ | | | | | | |
| `comment` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | S | |
| `view_shared` | ✓ | ✓ | ✓ | ✓ | A | ✓ | S | S |
| `export` | ✓ | ✓ | ✓ | ✓ | | ✓ | | |

¹ A co-founder cannot remove the owner or delete the workspace.
² Only when the member is flagged `authorised_signatory` (the owner by default).

Helper capabilities are further limited by the scope of their consent grant. The matrix lives in
`bizzagent/tenancy/permissions.py` as pure data and is tested for every (role, capability) pair.

## 5. Rules

- **Signatory.** Only members flagged `authorised_signatory` can tick declarations or submit
  proposals. A helper can prepare everything but cannot sign.
- **Personal space.** Private to the person. No workspace role, partner or platform admin can
  read it. The user can explicitly share an aggregate, for example an "owner's pay" figure.
- **Consent grants.** Helper, advisor and viewer access is a
  `ConsentGrant{grantee, scope, artifacts, expires_at}`. It is revocable, and every access is
  audited.
- **Partner reviewers** see only applications submitted to their own organisation.
- **Autonomy L3 never signs**, submits legally, pays third parties or touches the personal space
  ([agent operating model](../architecture/agent-operating-model.md)).
