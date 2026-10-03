# Journeys

> **What this is:** voice-first end-to-end journeys per persona. Each step names the screen
> ([ux-spec](../design/ux-spec.md)) and the skill ([agents](../architecture/agents.md)) involved.
> **Who reads it:** design, product, QA (these are the walkthrough scripts for the prototype).
> **Last reviewed:** 2026-10-02

## J1. Almaz: first contact to a submitted proposal (Afaan Oromo, helper mode)

1. **Onboarding.** Dawit opens the link. The language screen plays an audio sample of each
   language. Dawit taps **Afaan Oromo**.
2. **Account.** The phone number is entered. On "What brings you here?" Dawit picks **"I run a
   business"**, then the legal form **sole proprietorship** (with a TermTooltip).
3. **Onboarding interview** (Talk, concierge). Almaz answers by voice: the business, town, staff
   and what she needs. Each fact is read back.
4. **Helper consent.** Almaz invites Dawit as a **helper** with a 30-day consent grant (Team →
   Members). Dawit can prepare but not sign.
5. **Home.** The FidelJourney shows "operating". There are three next actions:
   - photograph the licence
   - review the gap list
   - a "Get funded" mission
6. **Mission "Get funded"** (Missions):
   1. The plan is shown with a CostTicket. Almaz approves.
   2. Licence photo → OCR → licence fields become `established`.
   3. The Readiness Score shows its top 3 actions.
   4. Common Application maps the file to the top 2 matched calls.
   5. Funder-panel simulation shows the weak sections.
   6. Almaz answers the remaining questions by voice.
7. **Declarations.** Each one is explained in Afaan Oromo, and understanding is recorded. Almaz
   ticks each box herself (Dawit cannot).
8. **Inbox.** A submit approval card arrives. Almaz approves by voice ("Eeyyee") with read-back.
9. **Submission.**
   - The on-platform call is submitted.
   - For the off-platform funder, a DOCX/PDF with QR verification is exported (Documents).
10. **Activity log** lists every step and the credits spent.

## J2. Nahom: real margin and a loan comparison (English)

1. Talk: "What's my margin on a board-level repair?" The numbers coach asks for the price,
   parts and time (each with "why we ask").
2. A FinancialSheet with a ReceiptTape trace. His inputs are `user_voice` (unverified), so
   BizzAgent suggests a statement import to make them `established`.
3. "What if I take a 200,000 birr loan for a rework station?" The loan calculator compares flat
   and declining balance and shows the effective rate. A what-if fork is saved.
4. Opportunity scout matches loan products and grants. Nahom adds one to the pipeline.

## J3. Selam: idea to a registration decision (Amharic)

1. Onboarding as an **explorer**.
2. **Idea clarifier.** Her rough idea becomes a one-liner, problem, customer and solution
   (version 1). She edits and approves it.
3. **Idea validation.** Riskiest assumptions, an interview script in Amharic, and logging
   interviews by voice.
4. **Business setup.** PLC vs sole proprietorship, with citations. Uncited questions get "I
   don't have a verified answer" and an advisor offer.
5. **Launch readiness.** What she can do before registering: cited, or "no verified answer".

## J4. Meron: hire a production supervisor (Amharic + English)

1. Team → Hiring → new role. The interview builds the role definition.
2. A job description in Amharic and English → approval → posting texts per channel (L2 approval
   to publish).
3. Applications: CVs and voice applications. Rubric screening with per-criterion quotes. No
   protected attributes are used.
4. Interview kit → offer letter template (cited labour pack entries or TODO, plus "review with a
   professional").

## J5. Abel: accelerator application and personal finance (English)

1. Opportunities: a YC-like programme and two local hackathons, sourced and dated.
2. The accelerator workspace:
   - questions extracted from the programme page, with character limits
   - drafts from the Business File only
   - a voice mock interview with rubric feedback
3. Money → **Personal (only you)**: a budget, a savings goal and owner's pay vs company profit.
   His co-founder cannot see it.

## J6. Ruth (funder): publish a call and review

1. Partner portal → Calls → builder. A versioned configuration covers the form, grid, gate,
   exclusions, declarations, languages and deadline.
2. Review list: a ranked shortlist with reasons, contradictions and site-visit questions.
3. Application detail: the evidence grade per field, the verification of the document hash, and
   an override with an audit note.

## J7. Tigist (advisor): expert stamp (designed, later)

1. A consented hand-off arrives from a client's mission.
2. Tigist reviews the LegalSetupPlan and adds an **expert stamp**, which becomes provenance
   `expert_review`.
