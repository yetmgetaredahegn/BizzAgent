# BizzAgent — Software Requirements Specification

> **What this is:** testable functional and non-functional requirements, after ISO/IEC/IEEE 29148. Every ID is mapped to a test in [traceability](traceability.md).
> **Who reads it:** engineers, QA, reviewers of every backend PR.
> **Last reviewed:** 2026-10-02

## 1. Introduction

- **Purpose.** This document specifies what the BizzAgent system shall do. The *why* is in the
  [PRD](../product/PRD.md); the *how* is in the [SAD](../architecture/SAD.md).
- **Scope.** The backend (FastAPI + LangGraph, package `bizzagent`) and the web client (Next.js,
  `web/`).
- **Conventions.**
  - "Shall" means mandatory. "Should" means recommended.
  - IDs never change; deleted requirements are marked *withdrawn*.
  - `[PR]` names the PR that delivers the requirement.
- **Definitions.** See the [glossary](../onboarding/GLOSSARY.md). *Provenance*, *artifact*,
  *skill*, *mission*, *call*, *pack entry* and *consent grant* are defined there.

## 2. Overall description

- **Users:** see the [personas](../product/personas.md) and [roles](../product/roles-and-permissions.md).
- **Operating environment.**
  - Server: Python 3.13, SQLite now and PostgreSQL later.
  - Browsers: the current two major versions of Chrome, Safari and Firefox, mobile first at
    390 px.
- **Constraints.**
  - No API keys in the repo.
  - Hosted model APIs in production, Ollama only in development, fake providers in CI
    ([ADR-0006](../architecture/adr/0006-pluggable-llm-per-role.md)).
- **Assumptions.**
  - Country-pack facts are verified by humans.
  - Payment and statement formats are verified before integration.

## 3. Functional requirements

### 3.1 Accounts, workspaces, roles — `FR-ACC` [C1]

| ID | Requirement |
|---|---|
| FR-ACC-001 | The system shall create an account from a phone number and a chosen language, with a private personal space. |
| FR-ACC-002 | The system shall create a workspace of type `explorer`, `team`, `business`, `collective` or `partner` from the "What brings you here?" answer, with a `legal_form` or partner kind where applicable. |
| FR-ACC-003 | The system shall enforce the capability matrix in [roles §4](../product/roles-and-permissions.md#4-capability-matrix-venture-workspace) for every API operation. |
| FR-ACC-004 | Only members flagged `authorised_signatory` shall tick declarations or submit proposals. |
| FR-ACC-005 | Helper, advisor and viewer access shall require a revocable `ConsentGrant` with a scope and an expiry. Every access shall be audited. |
| FR-ACC-006 | The system shall support invitations with a suggested role and plain-language role descriptions in 3 languages. |
| FR-ACC-007 | Converting a workspace type or legal form shall be a guided flow that writes an audit event. |
| FR-ACC-008 | Partner reviewers shall see only applications submitted to their own organisation. |

### 3.2 Concierge — `FR-CON` [C2]

| ID | Requirement |
|---|---|
| FR-CON-001 | On first contact, the concierge shall ask for the language before any other question. |
| FR-CON-002 | The concierge shall classify each user turn into an intent and route it to a skill, or answer directly. |
| FR-CON-003 | For an unknown or out-of-scope request, the concierge shall say it does not know and offer a human hand-off instead of improvising. |
| FR-CON-004 | Skills shall hand control back to the concierge, which summarises the outcome and the updated artifacts. |
| FR-CON-005 | The concierge shall show the journey stage and up to 3 next actions at the start of a session. |
| FR-CON-006 | A second message sent while a turn is running shall be rejected with HTTP 409 or queued, never processed concurrently. |
| FR-CON-007 | The user shall be able to undo the last answer (time travel), restoring the prior state. |

### 3.3 Language — `FR-LNG` [C1, C2]

| ID | Requirement |
|---|---|
| FR-LNG-001 | The system shall support `en`, `am` and `om` for all user-facing text and speech. |
| FR-LNG-002 | The user shall be able to switch language at any time by button or spoken intent. The pending prompt shall be re-phrased and re-spoken. |
| FR-LNG-003 | The chosen language shall be stored in the profile memory and reused. |
| FR-LNG-004 | Every user-facing model output shall pass a language guard (script and language). On failure the system shall fall back to a reviewed template. |
| FR-LNG-005 | Legal and declaration text shall come only from reviewed translations, never from generated text. |
| FR-LNG-006 | The system shall parse number words in 3 languages, Ge'ez numerals and "birr". |
| FR-LNG-007 | The system shall convert between Ethiopian (EC) and Gregorian (GC) dates and ask for read-back on ambiguity. |
| FR-LNG-008 | Original quotes shall be stored verbatim beside labelled translations. |
| FR-LNG-009 | The intents "I don't know", "explain", "repeat", "skip", "change language" and "finish" shall be recognised in 3 languages. |
| FR-LNG-010 | Locale files shall pass a key-completeness check in CI. |

### 3.4 Voice — `FR-VOX` [C2]

| ID | Requirement |
|---|---|
| FR-VOX-001 | Every turn shall accept voice (recorded or uploaded audio) or text. |
| FR-VOX-002 | ASR and TTS shall be selected per language through provider adapters, with a text fallback. |
| FR-VOX-003 | The transcript shall be editable before it is used. |
| FR-VOX-004 | Before a value enters an artifact, the system shall read back what it understood and wait for confirmation. |
| FR-VOX-005 | Every prompt shall be available as audio. |
| FR-VOX-006 | Stage events (for example "Reading your licence…") shall stream in the user's language. |

### 3.5 Memory — `FR-MEM` [C2]

| ID | Requirement |
|---|---|
| FR-MEM-001 | After each turn, the system shall propose memory candidates. Only user-confirmed candidates shall be stored. |
| FR-MEM-002 | Remembered facts shall enter skills with provenance `remembered` (unverified) and require read-back before they enter an official document. |
| FR-MEM-003 | The user shall be able to list, edit, forget (hard delete), export and pause memory. |
| FR-MEM-004 | The onboarding interview shall ask questions driven by profile gaps and allow an early exit at any point. |
| FR-MEM-005 | The system shall provide a copy-paste export prompt (3 languages) for other assistants and accept the pasted output. |
| FR-MEM-006 | The system shall accept verified export-file formats from other assistants and extract candidates only. |
| FR-MEM-007 | Imported items shall have provenance `imported`. Raw uploads shall be deleted after extraction. |

### 3.6 Numbers coach — `FR-NUM` [C1, C3]

| ID | Requirement |
|---|---|
| FR-NUM-001 | The system shall provide pure calculators for margin, markup, net worth, break-even, monthly cash flow, loan repayment (flat and declining balance, effective rate), ROI/payback, unit economics and pricing from cost. |
| FR-NUM-002 | Every calculation result shall include ordered steps, the inputs used and warnings. |
| FR-NUM-003 | Every input shall carry a source: said, document, ledger or a confirmed assumption. |
| FR-NUM-004 | Numbers shown to the user shall come only from calculator results, never from model text. |
| FR-NUM-005 | The user shall be able to fork a "what if" scenario and compare it with the original. |
| FR-NUM-006 | Results shall be saved to a `FinancialSheet` artifact with input provenance. |

### 3.7 Business setup — `FR-SET` [C3]

| ID | Requirement |
|---|---|
| FR-SET-001 | The setup interview shall collect owners, liability appetite, capital, sector, foreign participation and licence needs. |
| FR-SET-002 | The legal-form recommendation shall come from deterministic rules over the country pack, with reasons. |
| FR-SET-003 | Every legal statement shall cite a country-pack entry. Without one, the system shall say it has no verified answer and offer an advisor. |
| FR-SET-004 | The output shall be a `LegalSetupPlan` checklist artifact, exportable as PDF, marked "not legal advice". |

### 3.8 Launch readiness — `FR-LCH` [C3]

| ID | Requirement |
|---|---|
| FR-LCH-001 | The system shall state what may be done before formal registration only from cited pack entries. Otherwise it shall say "no verified answer, ask a professional". |
| FR-LCH-002 | The system shall produce a technical launch checklist: domain, hosting, privacy policy, terms, app stores, payments, analytics. |

### 3.9 Idea validation — `FR-IDE` [C3]

| ID | Requirement |
|---|---|
| FR-IDE-001 | The idea clarifier shall produce a one-liner, problem, customer, solution, alternatives and positioning as a versioned artifact that the user approves or edits. |
| FR-IDE-002 | The system shall produce a lean canvas, riskiest assumptions scored by a rubric, experiments and an interview script in the user's language. |
| FR-IDE-003 | Assumptions shall be labelled as assumptions until tested. Logged results shall update assumption confidence. |

### 3.10 Market research — `FR-MKT` [C3]

| ID | Requirement |
|---|---|
| FR-MKT-001 | Market sizing (TAM/SAM/SOM) shall be deterministic arithmetic over explicit, user-confirmed assumptions. |
| FR-MKT-002 | Every competitor and market fact shall have a URL and `retrieved_at`, or be labelled "user said". Otherwise it shall be dropped. |
| FR-MKT-003 | Competitor analysis shall separate global and local players and produce a localisation-gap table. |
| FR-MKT-004 | With the search provider set to `none`, the skill shall ask the user instead of searching. |

### 3.11 Funding proposals — `FR-FND` [C3]

| ID | Requirement |
|---|---|
| FR-FND-001 | A proposal shall pin the call configuration version current at creation. |
| FR-FND-002 | Claims extracted by the model shall be grounded: the quote must appear in the source and numbers must appear in the quote. Otherwise the claim is discarded. |
| FR-FND-003 | Merging shall set document evidence to `established`, voice to `unverified`, and disagreement to `contradictory` with both values kept. |
| FR-FND-004 | Contradictions, gaps, eligibility, exclusions and the score shall come from `bizzagent.rules` using the pinned configuration. |
| FR-FND-005 | Each gap shall state the field, why it is missing, what evidence is needed and who provides it. |
| FR-FND-006 | Declarations shall be explained in the user's language with understanding recorded. Only a user actor event shall tick them. |
| FR-FND-007 | Narrative and impact drafts shall be tagged `draft_for_approval` until the user approves them. |
| FR-FND-008 | Submission to an on-platform call shall make the proposal visible only to that funder's reviewers. A directory entry shall allow export only. |
| FR-FND-009 | A second proposal shall pre-fill from memory as `remembered`, with read-back per field. |

### 3.12 Documents and exports — `FR-DOC` [C3]

| ID | Requirement |
|---|---|
| FR-DOC-001 | The system shall export proposals (DOCX, PDF, JSON), business plans (DOCX), financial sheets (XLSX) and legal checklists (PDF). |
| FR-DOC-002 | Every document shall include a provenance legend and mark unverified, missing and contradictory items. |
| FR-DOC-003 | A document's language shall follow the call or the user's choice. Translations shall be labelled. |

### 3.13 Document verification — `FR-VER` [C3]

| ID | Requirement |
|---|---|
| FR-VER-001 | Every export shall store a SHA-256 hash and a `DocumentRecord`, and carry a QR code and short link to the verify page. |
| FR-VER-002 | The public verify page shall show the provenance summary and detect a hash mismatch on re-upload, without exposing private fields. |

### 3.14 Document explainer — `FR-DOX` [C3]

| ID | Requirement |
|---|---|
| FR-DOX-001 | The system shall explain a photographed or PDF document: parties, dates (EC/GC), money, obligations, rights, termination, penalties, red flags and questions for a lawyer. |
| FR-DOX-002 | Every point shall cite a quoted span and page. Unreadable regions shall be reported as unreadable. |
| FR-DOX-003 | Red flags shall come from a deterministic rule library. Legal context shall come only from cited pack entries. "Not legal advice" shall be shown. |
| FR-DOX-004 | After explaining, the system should propose actions: a calendar reminder, an expert review or a task. |

### 3.15 Opportunities — `FR-OPP` [C4]

| ID | Requirement |
|---|---|
| FR-OPP-001 | The catalogue shall store typed opportunities with a provider, eligibility, deadline, benefit, regions, sectors, stages, languages, source and freshness. |
| FR-OPP-002 | A discovered listing without a URL, or whose deadline, amount or eligibility is not found in the page text, shall be rejected. |
| FR-OPP-003 | Discovered listings shall have status `discovered`, never `verified` by the agent. |
| FR-OPP-004 | Expired opportunities shall never be suggested. "Closing soon" shall be flagged within 14 days. |
| FR-OPP-005 | Eligibility shall be a pure filter. An unverified profile fact shall yield "likely eligible" plus a confirm action. |
| FR-OPP-006 | Ranking shall be deterministic over fit, urgency, benefit and effort. |
| FR-OPP-007 | The scam guard shall flag fee-to-apply, payment to personal accounts, guaranteed-funding wording, missing organiser identity, a domain mismatch and urgency pressure, with reasons. |
| FR-OPP-008 | Duplicates across sources shall be merged by canonical URL and fuzzy title. |
| FR-OPP-009 | The pipeline shall track found → shortlisted → preparing → submitted → outcome, with a requirements checklist mapped to artifacts. |
| FR-OPP-010 | Deadline reminders shall be scheduled in EC and GC. Running the reminder job twice shall send one reminder. |

### 3.16 Accelerator and investor coach — `FR-ACL` [C4]

| ID | Requirement |
|---|---|
| FR-ACL-001 | Programme facts (questions, limits, deadlines) shall come only from the programme's own pages, cited with `retrieved_at`. |
| FR-ACL-002 | Draft answers shall never exceed their limits. Every claim shall map to an artifact field; unmapped claims are removed. |
| FR-ACL-003 | The system shall run a voice mock interview with rubric feedback. |

### 3.17 Market entry — `FR-MKE` [C4]

| ID | Requirement |
|---|---|
| FR-MKE-001 | The attractiveness score shall be a deterministic weighted rubric over confirmed indicators labelled researched, user-said or assumption. |
| FR-MKE-002 | Requirements shall be cited (pack or URL) or recorded as `TODO(source)`, never asserted. |
| FR-MKE-003 | The output shall be a `MarketEntryPlan` with entry mode, cost to enter and break-even (from `calc`), exportable as DOCX. |

### 3.18 Journey — `FR-JRN` [C4]

| ID | Requirement |
|---|---|
| FR-JRN-001 | The stage (idea, validated, formalised, operating, growing, funded, expanding) shall be inferred deterministically from the artifacts. |
| FR-JRN-002 | Next best actions shall be pure, at most 3, each with a reason and the skill that handles it. |
| FR-JRN-003 | The weekly check-in shall respect snooze, opt-out and quiet hours. |

### 3.19 Hiring and resources — `FR-HIR` [C5]

| ID | Requirement |
|---|---|
| FR-HIR-001 | The system shall draft job descriptions in 3 languages, with approval before publishing. |
| FR-HIR-002 | Applications shall be accepted as CVs or voice applications. |
| FR-HIR-003 | Screening shall be a rubric over job-related criteria. The model only extracts evidence quotes per criterion. |
| FR-HIR-004 | Contract templates and payroll rates shall be cited, or returned as TODO, never as a number. |
| FR-HIR-005 | The resource finder shall list freelancers, interns, suppliers, training and BDS, each with a source URL. |

### 3.20 Money — `FR-MON` [C5]

| ID | Requirement |
|---|---|
| FR-MON-001 | The business ledger shall produce an income statement, cash position and KPIs through `calc`, each showing the ledger source. |
| FR-MON-002 | The personal space shall hold a budget, savings goals, personal net worth and owner's pay. It is reachable only by its owner. |
| FR-MON-003 | "Can I afford X?" shall be answered with a calculation trace. |

### 3.21 Growth — `FR-GRW` [C5]

| ID | Requirement |
|---|---|
| FR-GRW-001 | The growth plan shall hold objectives, KPIs from the ledger or user-confirmed data, and initiatives. Targets shall be labelled as targets. |
| FR-GRW-002 | The ledger anomaly watcher shall create exactly one inbox item per anomaly, for example a margin drop or runway under N weeks. |

### 3.22 Missions — `FR-MIS` [C2]

| ID | Requirement |
|---|---|
| FR-MIS-001 | A goal shall be turned into a mission plan (a DAG of tasks across skills, with owners, dependencies, due dates and a credit estimate), validated deterministically. |
| FR-MIS-002 | The plan shall be shown with a cost ticket before it starts. |
| FR-MIS-003 | Missions shall be durable: they survive a restart and resume on an external event. |
| FR-MIS-004 | Missions shall be pausable, editable, cancellable and forkable. |
| FR-MIS-005 | Missions shall ship with templates: get funded, register my business, launch my MVP, get into an accelerator, enter a new market, validate my idea, hire for a role, monthly close. |

### 3.23 Inbox — `FR-INB` [C2]

| ID | Requirement |
|---|---|
| FR-INB-001 | Consequential actions (submit, share, send, book, spend over the threshold, publish) shall produce an approval card with what, why, evidence, cost and an undo window where possible. |
| FR-INB-002 | Approval by voice shall require read-back. |
| FR-INB-003 | Questions the agent needs answered shall be ordered by how much they unblock. |

### 3.24 Autonomy — `FR-AUT` [C2]

| ID | Requirement |
|---|---|
| FR-AUT-001 | Each skill and mission shall have an autonomy level L0–L3, adjustable by the user, with conservative defaults. |
| FR-AUT-002 | L3 shall never sign, submit legally, pay third parties or touch personal-space data. |
| FR-AUT-003 | Standing instructions in plain language shall be parsed into policy objects, shown back for confirmation, and enforced deterministically. |
| FR-AUT-004 | A budget cap shall halt a mission. |

### 3.25 Verifiers — `FR-VFY` [C2]

| ID | Requirement |
|---|---|
| FR-VFY-001 | Grounding, rules, language and policy verifiers shall run before any output reaches the user. |
| FR-VFY-002 | A failed verifier shall trigger a bounded revision, or an explicit "couldn't verify" to the user. It shall never pass silently. |
| FR-VFY-003 | The funder-eye and red-team critics should score drafts against the call rubric and look for overclaims. |

### 3.26 Activity log — `FR-ACT` [C2]

| ID | Requirement |
|---|---|
| FR-ACT-001 | Every agent step, source used, approval and credit spent shall be recorded in the workspace activity log, exportable. |
| FR-ACT-002 | Every artifact shall show the mission and agent that produced it. |

### 3.27 Billing — `FR-BIL` [C1]

| ID | Requirement |
|---|---|
| FR-BIL-001 | Each account shall have a wallet in credits. A workspace may have a shared wallet with per-member caps. |
| FR-BIL-002 | Top-ups shall go through `PaymentProvider` adapters, with signature-verified, idempotent webhooks. |
| FR-BIL-003 | Every billable action shall emit a `UsageEvent` against a versioned price list. |
| FR-BIL-004 | An estimate shall be shown and confirmation asked before any action above the threshold. |
| FR-BIL-005 | Charges shall land only on success. Failures shall be refunded automatically. |
| FR-BIL-006 | Spending caps shall never be exceeded. |
| FR-BIL-007 | Free actions (learning basics, viewing and exporting own data, account deletion) shall never be metered. |
| FR-BIL-008 | The credit ledger shall be double-entry and balance to zero. |

### 3.28 Passport, Common Application, readiness — `FR-PAS`, `FR-CAP`, `FR-RDY` [C4]

| ID | Requirement |
|---|---|
| FR-PAS-001 | The Passport shall snapshot facts with their evidence grade. An unverified fact shall never be shown as established. |
| FR-PAS-002 | Passport shares shall have a scope, an expiry and revocation. Every view shall be audited. |
| FR-CAP-001 | The Common Application shall map Business File fields onto each call's form through `field_map`, with gaps per call. |
| FR-RDY-001 | The readiness score shall be deterministic, explain its components and show the top 3 actions that raise it. |
| FR-RDY-002 | Funders shall see the score only with the venture's consent. |

### 3.29 Statement import and connector — `FR-IMP`, `FR-MCP` [C6]

| ID | Requirement |
|---|---|
| FR-IMP-001 | Statement imports shall use parsers for verified formats, or a CSV mapping wizard. Duplicates shall not be double-counted. |
| FR-IMP-002 | Imported amounts and dates shall be `established` (source `user_document`). Category suggestions shall never be applied without confirmation. |
| FR-MCP-001 | The MCP server shall expose `knowledge_search`, `calc_*`, `opportunities_search`, `business_file_read` and `passport_share`, scoped per workspace. |
| FR-MCP-002 | Every connector call shall be metered and audited, and tools shall return citations. Access outside the token's workspace shall be refused. |

### 3.30 Partner platform — `FR-ORG`, `FR-CALL`, `FR-DIR` [C1, C3]

| ID | Requirement |
|---|---|
| FR-ORG-001 | Partner organisations shall manage members with partner roles. |
| FR-CALL-001 | Call configurations shall be immutable, versioned JSON with a SHA-256 hash. |
| FR-CALL-002 | Calls shall be filterable by sector, region and language. |
| FR-DIR-001 | Directory entries shall hold off-platform submission instructions and allow export-only proposals. |

### 3.31 Knowledge packs — `FR-KNW` [C1]

| ID | Requirement |
|---|---|
| FR-KNW-001 | Every pack entry shall have at least one source with a URL and `retrieved_at`. Published entries shall have `verified_by`. |
| FR-KNW-002 | `bizzagent knowledge validate` shall fail CI on invalid entries. |
| FR-KNW-003 | Retrieval shall use the Store semantic index, with a BM25 fallback. |
| FR-KNW-004 | Entries past `review_due` shall be flagged as stale in answers. |

### 3.32 Later — `FR-EXP2`, `FR-BEN` (designed only)

| ID | Requirement |
|---|---|
| FR-EXP2-001 | An expert review shall add provenance `expert_review{by, credential, date, scope}`. |
| FR-BEN-001 | Benchmarks shall be opt-in, with k-anonymity ≥ 10 per cell. Smaller cells shall be hidden. |

## 4. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-HON-001 | The language model shall never be recorded as a provenance source. |
| NFR-HON-002 | A value without a source shall not be shown as fact. |
| NFR-HON-003 | Contradictions shall keep both values. |
| NFR-HON-004 | Fabricated facts on the golden eval set shall be 0. |
| NFR-SAF-001 | Legal, tax and investment guidance shall include a "not advice" notice and a professional pointer. |
| NFR-SAF-002 | Transcripts and fetched web pages shall be treated as untrusted input (prompt injection); they cannot change tools, policy or autonomy. |
| NFR-I18N-001 | No user-facing string shall be hard-coded outside the locale files. |
| NFR-I18N-002 | Every skill path shall be tested in 3 languages, including code-switching. |
| NFR-ACC-001 | The web client shall meet WCAG 2.2 AA: 44 px targets, reduced motion, colour never the only signal. |
| NFR-ACC-002 | The body text shall be at least 16 px on mobile. Amharic line height shall be 1.7. |
| NFR-PERF-001 | A text turn shall stream its first stage event in < 1 s at the 95th percentile, excluding model latency. |
| NFR-PERF-002 | The mobile Lighthouse performance score shall be ≥ 85 on the landing page and Home. |
| NFR-SEC-001 | Secrets shall be loaded only from the environment or a secret manager. |
| NFR-SEC-002 | Uploads shall be type- and size-checked and stored outside the source tree. |
| NFR-PRIV-001 | Personal-space data shall be unreachable through any workspace, partner or admin token. |
| NFR-PRIV-002 | PII not needed by a hosted model shall be redacted from prompts. |
| NFR-PRIV-003 | Users shall be able to export and delete their data. |
| NFR-FAIR-001 | Protected attributes shall never reach the screening scorer or its prompts. |
| NFR-TEN-001 | Org-owned data shall be reachable only through repositories scoped by `org_id`. A foreign org receives 404. |
| NFR-REL-001 | Graph threads shall be checkpointed and resumable after a crash. |
| NFR-REL-002 | Background jobs shall be idempotent. |
| NFR-OBS-001 | Every run shall log a `run_id`, the skill, the model per role, token usage and latency. |
| NFR-MNT-001 | `calc`, `rules` and `knowledge` shall not import LLM or LangChain modules (architecture test). |
| NFR-MNT-002 | Docs shall be updated in the same PR as the behaviour they describe. |
