# BizzAgent — Product Requirements Document

> **What this is:** the product definition: vision, users, principles, epics and how we measure success.
> **Who reads it:** everyone. Start here.
> **Last reviewed:** 2026-10-02

Related: [personas](personas.md) · [journeys](journeys.md) · [feature catalog](feature-catalog.md) ·
[differentiation](differentiation.md) · [roles](roles-and-permissions.md) · [pricing](pricing-and-billing.md) ·
[platform model](platform-model.md) · [roadmap](roadmap.md) · [SRS](../requirements/SRS.md)

## 1. Vision

BizzAgent is a **voice-first business agent** for people who have an idea, teams building
something, small businesses, and established businesses that want to grow. It speaks
**Amharic, Afaan Oromo and English**, starts with Ethiopia and is built so other countries can
be added as knowledge packs.

General AI assistants give *answers*. BizzAgent gives **verified, stamped, submittable
outcomes**. They are tied to verified local knowledge, to the user's own numbers over time, and
to the funders and programmes that can act on them. See [differentiation](differentiation.md).

## 2. Problem

- Money, programmes and markets exist for small Ethiopian businesses, but reaching them takes
  formal paperwork: sales history, staff splits, organograms, declarations and business plans.
  Many owners are low-literacy, voice-first or on feature phones.
- Founders don't know the basics: the difference between a sole proprietorship and a PLC,
  shareholders, the Chamber of Commerce, TIN or VAT, how to register, and what they may do before
  registering.
- People guess their numbers. Margin, cash flow and loan cost are rarely computed correctly.
- Opportunities are scattered and short-lived, and some are scams.
- General assistants invent local facts, forget the business between chats, and can't submit
  anything anyone accepts.

## 3. Users

See [personas](personas.md). Venture-side users:

- **Explorer:** idea only.
- **Team:** unregistered co-founders.
- **Business:** informal, sole proprietorship, one-member PLC, PLC, share company or
  partnership.
- **Collective:** cooperative, association or NGO.

Partner-side users:

- **Funder**
- **Programme:** incubator, accelerator, hackathon, investor network
- **Support organisation:** business development services (BDS) and advisors

## 4. Product principles

1. **Evidence over guessing.** Every value has a provenance status: `established`,
   `unverified`, `missing` or `contradictory`. It also has a source. **The language model is
   never a source.**
2. **Rules do the arithmetic.** Calculations, eligibility and scoring are deterministic Python
   (`bizzagent.calc`, `bizzagent.rules`). The model explains them; it never types a result.
3. **No citation, no claim.** Legal, tax and market facts come only from cited knowledge-pack
   entries or URLs. Without one, BizzAgent says *"I don't have a verified answer"* and offers a
   human expert.
4. **The user decides.** Declarations are explained, never ticked. Consequential actions go
   through the approvals inbox. Autonomy is opt-in, per skill.
5. **Your language, your channel.** Everything the user hears or reads is in their chosen
   language and can be switched at any time. Voice works everywhere.
6. **Artifacts over chat.** The product is the Business File (profile, plans, sheets,
   proposals), not the transcript.
7. **The moat test.** A feature ships only if it uses at least one moat: verified local
   knowledge, persistent business data, the network, real-world rails, local access or human
   experts. See [differentiation §3](differentiation.md#3-the-moat-test).
8. **Honest billing.** The cost is shown before any paid action. Users pay only on success,
   within their caps. See [pricing](pricing-and-billing.md).
9. **Not AI slop.** The UI is a clean, editorial tool. See
   [ux-principles](../design/ux-principles.md).

## 5. Non-goals

- BizzAgent is not a law firm, an accounting firm or a bank. It explains and prepares; it never
  gives a legal, tax or investment determination without a source and a professional pointer.
- It does not move money to third parties in v1. Wallet top-ups are the only payments.
- It does not invent real-world opportunities, competitors, funders or legal requirements.
- It does not use protected attributes in hiring.

## 6. Epics

Each epic lists user stories with acceptance criteria. Requirement IDs are in the
[SRS](../requirements/SRS.md). Priorities use MoSCoW: **M** must, **S** should, **C** could,
**W** won't now.

| # | Epic | Priority | SRS prefix |
|---|---|---|---|
| E1 | Accounts, workspaces, roles, consent | M | `FR-ACC` |
| E2 | Concierge, voice and language | M | `FR-CON`, `FR-VOX`, `FR-LNG` |
| E3 | Memory and learning, AI-history import | M | `FR-MEM` |
| E4 | Numbers coach | M | `FR-NUM` |
| E5 | Business setup and launch readiness | M | `FR-SET`, `FR-LCH` |
| E6 | Idea validation and clarifier | M | `FR-IDE` |
| E7 | Market research (global vs local) | M | `FR-MKT` |
| E8 | Funding proposals and exports | M | `FR-FND`, `FR-DOC`, `FR-VER` |
| E9 | Opportunity scout and pipeline | M | `FR-OPP` |
| E10 | Accelerator and investor coach | S | `FR-ACL` |
| E11 | Market entry | S | `FR-MKE` |
| E12 | Journey planner | M | `FR-JRN` |
| E13 | Hiring and resources | S | `FR-HIR` |
| E14 | Money coach (business + private personal) | S | `FR-MON` |
| E15 | Growth coach | S | `FR-GRW` |
| E16 | Document explainer | S | `FR-DOX` |
| E17 | Missions, inbox, autonomy, verifiers, activity | M | `FR-MIS`, `FR-INB`, `FR-AUT`, `FR-VFY`, `FR-ACT` |
| E18 | Wallet and pay-as-you-go | M | `FR-BIL` |
| E19 | Passport, Common Application, Readiness Score | S | `FR-PAS`, `FR-CAP`, `FR-RDY` |
| E20 | Statement import, MCP connector | S | `FR-IMP`, `FR-MCP` |
| E21 | Partner portal: calls, opportunities, review | S | `FR-ORG`, `FR-CALL`, `FR-DIR` |
| E22 | Expert stamps, benchmarks, deal room | C | `FR-EXP2`, `FR-BEN` |
| E23 | Telegram / WhatsApp / IVR channels | W (designed) | — |

### Representative stories

The SRS holds the full list. These are the stories the design must make easy.

- **E2.** *As Almaz, I choose Afaan Oromo by voice on the first screen, so that I never see
  English again unless I ask.*
  - The language is asked before anything else.
  - The choice is remembered.
  - The current question is re-spoken when the user switches language.
- **E4.** *As Nahom, I ask "what is my real margin?", so that I stop guessing.*
  - BizzAgent asks for each input with a "why we ask" line and reads it back.
  - It shows the result with a step-by-step calculation trace.
  - Each input shows its source.
- **E5.** *As Selam, I ask "PLC or sole proprietorship?", so that I can pick a legal form.*
  - The answer cites country-pack entries.
  - An uncited point is refused and an advisor is offered.
  - The result is saved as a `LegalSetupPlan` checklist.
- **E8.** *As Almaz, I submit a proposal to a funder that isn't on the platform.*
  - The DOCX/PDF includes a provenance legend, a QR verification link and every unverified field
    marked.
  - Declarations are ticked only by Almaz.
- **E9.** *As Abel, I get hackathons and accelerators matched to my studio.*
  - Every listing has a source URL and a freshness date.
  - Scam flags show their reasons.
  - A listing that rests on an unverified profile fact says "likely eligible".
- **E14.** *As Abel, I keep personal money private from my co-founder.*
  - No workspace role or admin can read the personal space.
- **E17.** *As Meron, I start a "Get funded" mission.*
  - The plan and a cost ticket are shown first.
  - Submission waits for my approval.
  - Every step appears in the activity log.
- **E18.** *As any user, I see the cost before a paid action.*
  - A failed run is refused.
  - The spending cap is never exceeded.

## 7. Success metrics

| Metric | Target | How measured |
|---|---|---|
| Fabricated facts on the golden eval set | **0** | `make eval`, see [testing](../engineering/testing-and-evaluation.md) |
| User-facing factual claims with a source | ≥ 98% | eval + production sampling |
| Task completion in the chosen language | ≥ 85% per language | analytics: funnel by language |
| Time to the first artifact after sign-up | < 10 min median | analytics |
| Proposals per business per quarter | ≥ 2 for active businesses | DB |
| Submissions on-platform vs exported | tracked, no target | DB |
| Advisor hand-offs accepted | tracked | DB |
| Calc correctness | 100% | unit and property tests |
| Billing disputes | < 0.5% of charges | ledger |

## 8. Risks and open questions

Risks are tracked in the [SAD §11](../architecture/SAD.md#11-risks-and-technical-debt). Open
questions:

- Which hosted speech APIs handle Amharic and Afaan Oromo well enough? This needs a spike with
  recorded samples.
- Payment gateway terms and APIs (Chapa, telebirr, Stripe) must be verified before integration.
- Which Ethiopian registries offer a public lookup API? Unknown; country-pack research is needed.
- The Amharic name transliteration ("ቢዝኤጀንት") and the ብ logo need native review.
