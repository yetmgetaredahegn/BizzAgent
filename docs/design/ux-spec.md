# UX specification

> **What this is:** the information architecture, navigation, routes, and every screen with a wireframe description and its states. PR F implements exactly this.
> **Who reads it:** designers, front-end engineers, QA (walkthroughs).
> **Last reviewed:** 2026-10-02

Components are named as in [DESIGN_SYSTEM](DESIGN_SYSTEM.md). API calls are named as in
[api.md](../engineering/api.md).

**State legend:**

| Code | State | What the screen shows |
|---|---|---|
| **E** | Empty | A line drawing, one sentence, one primary action |
| **L** | Loading | The stage-specific StageStatus text |
| **P** | Partial | What exists, plus what's missing as QuestionCards |
| **X** | Error | What happened and a recovery action |
| **O** | Offline | The OfflineBanner and queued actions; cached data is read-only |

Every screen implements all five unless marked n/a.

## 1. Information architecture and routes

### Venture app (`/w/[ws]/…`; the personal space is `/me/…`)

| Nav (mobile bottom bar = first 5) | Route | Content |
|---|---|---|
| **Home** | `/w/[ws]` | FidelJourney, ≤ 3 next actions with reasons, active missions, inbox count, deadlines, recent artifacts |
| **Talk** | `/w/[ws]/talk` | Concierge: conversation pane + artifact pane |
| **Inbox** | `/w/[ws]/inbox` | Approval and question cards |
| **Business File** | `/w/[ws]/file` | Artifacts grouped by domain, each with completeness and a provenance summary |
| **Opportunities** | `/w/[ws]/opportunities` | Matches, then the pipeline board |
| More → Missions | `/w/[ws]/missions`, `/w/[ws]/missions/[id]` | Mission board and detail |
| More → Money | `/w/[ws]/money`, `/me/money` | Business finance; a "Personal (only you)" toggle goes to `/me/money` |
| More → Team | `/w/[ws]/team`, `/w/[ws]/team/hiring/[job]` | Members and roles, consent, hiring |
| More → Documents | `/w/[ws]/documents` | Exports with source artifact and version |
| More → Wallet | `/me/wallet` | Balance, top-up, usage, price list, cap, receipts |
| More → Activity | `/w/[ws]/activity` | Activity log |
| More → Settings | `/me/settings/*` | Language, memory, autonomy, standing instructions, connectors, notifications, consent |

**Artifact routes:** `/w/[ws]/file/[kind]/[id]`, where `kind` is one of `profile`, `legal`,
`launch`, `idea`, `validation`, `market`, `entry`, `finance`, `proposal`, `accelerator`,
`growth`, `explainer`.

**Funding:** `/w/[ws]/funding/[proposal]/{pack,gaps,declarations,score,impact,submit}`. The old
`/apply/*` screens move here.

**Other venture routes:**

- Passport: `/w/[ws]/passport`
- Readiness: `/w/[ws]/readiness`
- Common Application: `/w/[ws]/common-application`
- Statement import: `/w/[ws]/money/import`

### Partner portal (`/p/[org]/…`)

| Route | Content |
|---|---|
| `/p/[org]` | Overview: open calls, applications awaiting review |
| `/p/[org]/calls`, `/p/[org]/calls/[id]` | Call / opportunity builder with versions |
| `/p/[org]/review`, `/p/[org]/review/[application]` | Ranked list and application detail. The old `/review/*` screens move here |
| `/p/[org]/ventures` | Mentored ventures (consented) |
| `/p/[org]/members` | Members and partner roles |

### Public routes

| Route | Content |
|---|---|
| `/` | Landing page |
| `/start/*` | Onboarding |
| `/v/[id]` | Document verification |
| `/passport/[token]` | Shared Passport view |
| `/404` | Not found |
| `/offline` | Offline page |

## 2. Onboarding (`/start/*`)

Full-screen steps, one question per screen, an audio button on every step, and a progress row
(7 dots).

1. `/start` · **Language.**
   - Three large tiles: "አማርኛ", "Afaan Oromoo", "English". Each has a play button for a sample.
   - A mic button: "or say it".
   - No other content.
2. `/start/phone` · Phone number with a country code (default +251), and "why we ask".
3. `/start/path` · **"What brings you here?"**
   - Five tiles, one per row in §2 of [roles](../product/roles-and-permissions.md#2-workspace-types-and-legal-forms),
     each with a one-line description.
   - "Business" opens the legal-form chooser, with a TermTooltip on each form and an "I'm not
     sure" option.
4. `/start/interview` · **Onboarding interview.**
   - The Talk layout, simplified: a question, VoicePill, ReadBackCard.
   - A "Finish later" link, always visible.
   - Progress shown as "4 of about 8".
5. `/start/context` · **Bring your context** (optional).
   - Two options: "Copy a prompt for ChatGPT / Claude / Gemini" (with a copy button and steps)
     or "Upload an export file". Plus a "Skip" button.
6. `/start/review` · Imported candidates: a list with keep / edit / discard per item.
7. Lands on **Home** with 3 real actions and the starter-credit balance.

**States:**

- **L** "Setting up your workspace…"
- **X** OTP or network failure, with retry.
- **O** Steps 1–4 can be completed offline and synced later.

## 3. Home (`/w/[ws]`)

- **Desktop wireframe** (12 columns):
  - Columns 1–8: FidelJourney across the top, then "Next actions" (≤ 3 ActionRows: verb, reason
    and skill chip), then active missions as MissionStep summaries.
  - Columns 9–12: an inbox summary card (count and the top card), deadlines (DualDate list),
    recent artifacts.
- **Mobile:** a single column in the same order. The inbox summary is pinned under the journey.
- **E** (new workspace): the journey at "idea" and 3 starter actions; never blank.
- **P:** missing profile facts appear as a QuestionCard.

## 4. Talk (`/w/[ws]/talk`)

- **Desktop:** a ledger spread.
  - Left: the conversation (receipt roll, 360–420 px wide).
  - Right: the active artifact sheet (CarbonSheet), with tabs for the artifacts this
    conversation touched.
- **Conversation turns:**
  - BizzAgent bubbles are plain text on `surface`, with a listen button.
  - User turns are right-aligned, showing the transcript with an "edited" marker.
  - Stage events appear as StageStatus lines.
  - ReadBackCard inline.
  - CostTicket inline before paid actions.
- **Composer:** a large VoicePill, a text field, and the language button.
- **Mobile:** tabs "Talk" / "Sheet". The Sheet tab shows a badge when the artifact changes.
- **States:**
  - **E:** a greeting and 3 suggested starters taken from the next actions.
  - **L:** stage text.
  - **X:** the turn failed. Retry keeps the transcript.
  - **O:** the voice note is queued.

## 5. Inbox (`/w/[ws]/inbox`)

- **Filter tabs:** All · Approvals · Questions.
- **ApprovalCard anatomy:**
  - title (the verb + object)
  - "why" (the mission and step)
  - evidence summary (stamps)
  - CostTicket
  - undo window
  - Approve / Decline / 🎤 approve by voice (read-back)
- **Batch:** select cards of the same type → "Approve 3". A confirmation lists them.
- **E:** "Nothing needs you right now."

## 6. Missions

- **Board (`/missions`):** columns Planned · Running · Waiting on you · Done. Each card shows the
  goal, progress, next step, owner avatars and the credits spent / estimate.
- **New mission:** a goal sentence or a template picker → plan preview (step list with
  dependencies, owners, approval points marked ◆) → CostTicket → Start.
- **Detail (`/missions/[id]`):**
  - a step timeline: status, owner, verifier results (pass, revise, couldn't verify), artifacts
    produced
  - an activity sub-log
  - actions: Pause / Edit plan / Cancel / **Fork** ("try another plan")

## 7. Business File (`/w/[ws]/file`)

Artifacts are grouped by domain (Learn, Start, Validate & plan, Run & grow, Money, Team, Fund,
Reach markets). Each row shows the artifact name, version, a completeness bar and stamp counts
(e.g. 12 established · 3 unverified · 2 missing).

### Artifact views

| View | Key elements |
|---|---|
| **FinancialSheet** | Calculator results as tables; each figure opens its ReceiptTape; inputs list their sources; "What if" fork comparison side by side |
| **LegalSetupPlan** | Recommendation with reasons; checklist with a CitationSlip per step; "not legal advice"; "Ask an advisor" |
| **LaunchChecklist** | Two sections, "Legal (cited)" and "Technical"; uncited items show "No verified answer" |
| **IdeaCanvas** (clarifier) | Version selector; a diff between versions (added and removed text, never colour only); Approve version |
| **ValidationPlan / EvidenceBoard** | Assumptions with risk score and confidence; experiments; logged interviews (voice) |
| **MarketReport** | Sizing (ReceiptTape over assumptions); competitors table split into Global and Local; localisation-gap table; every row has a CitationSlip |
| **MarketEntryPlan** | Attractiveness rubric table; entry mode with reasons; cost to enter + break-even; cited requirements or TODO |
| **Proposal** | Tabs for Pack / Gaps / Declarations / Score / Impact / Submit (these reuse the existing funding screens, restyled) |
| **AcceleratorApplication** | Questions with character counters (over the limit = error); drafts with claim → artifact links; Mock interview button |
| **DocumentExplanation** | Photo or PDF with highlighted spans ↔ the explanation list (side by side on desktop, stacked on mobile); red flags; proposed actions |
| **JobOpening / CandidatePipeline** | JD in 3 languages; candidates with per-criterion scores and quotes; no photos or protected attributes shown in screening |
| **GrowthPlan** | Objectives → KPIs (ledger-sourced) → initiatives; targets labelled "target" |

## 8. Opportunities

- **Matches** (`/opportunities`):
  - filters: type, deadline, amount, language
  - each match shows the type stamp, title, provider, DualDate deadline (with "closing soon"),
    fit reasons, eligibility ("Eligible" / "Likely eligible: confirm X" / "Not eligible: why"),
    ScamFlag if any, source domain and freshness
  - action: Add to pipeline
- **Detail:** the full listing, the eligibility breakdown, the requirements checklist mapped to
  artifacts, the source CitationSlip and "Report a problem".
- **Pipeline board:** found → shortlisted → preparing → submitted → outcome.
- **E:** "No matches yet. Complete your profile to get better matches", with the missing facts.

## 9. Fund (differentiators)

| Screen | Content |
|---|---|
| **Readiness** | Score (big figure) + component table + "Top 3 actions that raise it"; a deterministic explanation |
| **Common Application** | Choose calls → a matrix of fields × calls showing filled / gap per call; one answer fills many |
| **Passport** | Facts with evidence grades; Share (link or QR, expiry, scope); active shares with revoke; view log |
| **`/v/[id]`** (public) | Document title, issuer workspace (name only), created date, provenance summary counts, verifiers, "Upload to compare" → match / altered |
| **`/passport/[token]`** | Read-only Passport view; expired → explanation |

## 10. Money

- **Business:** ledger table, income statement, cash position, KPIs (each with a ReceiptTape),
  and "Import statement".
- **Statement import:** upload → detected format or CSV mapping wizard → preview with duplicates
  marked → categorise (suggestions need confirmation) → import.
- **Personal (`/me/money`):** a header band reading "Personal: only you can see this"; budget,
  savings goals, personal net worth, owner's pay vs business profit, "Separate the money"
  checklist.

## 11. Team

- **Members:** a table of name, role (with a plain description), signatory flag and consent
  expiry; Invite (suggested role).
- **Consent grants:** grantee, scope, artifacts, expiry, revoke, access log.
- **Hiring:** job list → JobOpening and CandidatePipeline views.

## 12. Documents and export

- **Documents:** a list of title, format, language, source artifact and version, hash (short),
  created, and download/verify links.
- **Export dialog:** format, language (the call's or the user's), provenance legend preview,
  CostTicket if metered.

## 13. Wallet (`/me/wallet`)

- Balance (big figure), Top up (provider choice → amount → redirect or sandbox), spending cap
  editor, low-balance alert setting.
- Usage history: a table of date, action, units, credits and run link, filterable.
- Price list (version and effective date). Receipts.

## 14. Settings (`/me/settings/*`)

| Page | Content |
|---|---|
| **Language** | Choice with samples; voice auto-play; dual-date order |
| **Memory: "What BizzAgent knows"** | List by topic and source with stamps; edit, forget, export; pause learning; import |
| **Autonomy** | Per skill, an L0–L3 segmented control with a plain explanation of each level; L3 shows its hard limits |
| **Standing instructions** | Plain-language editor → "Here is how I understood it" (structured policy shown) → Confirm |
| **Connectors** | MCP setup instructions for Claude, ChatGPT and generic clients; tokens per workspace with scope; revoke |
| **Notifications** | Channels, quiet hours |

## 15. Activity (`/w/[ws]/activity`)

A timeline of agent, action, sources, approvals and credits, with filters by mission, agent and
member. Export as CSV or JSON.

## 16. Partner portal

- **Call builder:** sections for form fields (+ field map), grid criteria and weights,
  eligibility gate, exclusions, declarations (reviewed texts only), languages, deadline and
  submission mode.
  - Preview scoring on a sample.
  - Publish creates a new immutable version; old versions are read-only.
- **Review list:** a ranked shortlist with shortlist / reserve / excluded; filters; CSV export.
- **Application detail:** justification, contradictions, site-visit questions, criteria, the
  evidence grade per field, the document hash check, and an override with a required audit
  note.

## 17. Landing (`/`)

- **Leads with the positioning:** "Verified, stamped, submittable." Hero: a single stamped
  document mock (CarbonSheet) next to a voice turn that produced it. No blobs, no chips, no
  gradients.
- **Sections:**
  1. How it works (talk → stamped artifacts → submit or export)
  2. The moats, in plain words (verified local knowledge, your real numbers, funders on the
     platform, three languages)
  3. For partners
  4. Pricing (pay as you go, the honest-billing rules)
  5. Footer
- Copy in 3 languages, with a language switch in the header.

## 18. Prototype personas

A dev toolbar switches the demo persona and language. The personas are Selam (explorer), a team,
Almaz (sole proprietorship, with helper Dawit), Meron (PLC), Abel (one-member PLC), Ruth
(funder), Daniel (programme manager) and Tigist (advisor).
