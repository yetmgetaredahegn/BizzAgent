# Differentiation: why BizzAgent and not a general assistant

> **What this is:** BizzAgent's positioning against ChatGPT, Claude (including Cowork), Gemini and similar, the moat test, and the unique features.
> **Who reads it:** product, marketing, anyone proposing a feature.
> **Last reviewed:** 2026-10-02

## 1. Positioning

General assistants give **answers**. BizzAgent gives **verified, stamped, submittable
outcomes**. They are tied to:

- local truth (cited, human-verified country packs)
- the user's real numbers over time (ledger, statements, artifacts)
- the people who fund them (on-platform funders and programmes)

It also works **inside** those assistants through an MCP connector, so it complements them rather
than only competing with them.

## 2. Comparison

| Need | General assistant today | BizzAgent | Moat |
|---|---|---|---|
| "How do I register a one-member PLC in Ethiopia?" | Plausible text that may be outdated or invented | A verified pack entry with a citation, verifier and review date, then a stamped checklist; escalation to a vetted local expert | K, H |
| "What's my real margin?" | Computes from whatever you type at that moment | Margin from **your ledger** (voice entries, receipts, imported statements), tracked over time and benchmarked | D |
| "Find me funding or accelerators" | A web search summary | Deterministic eligibility on on-platform calls, the Common Application, deadline watchers, a scam guard, outcome stats | N |
| "Write my proposal" | A draft document | An evidence-graded pack funders accept and can verify: QR-verifiable, tamper-evident, expert-stamped when needed, submitted on-platform | R, N |
| "Help me in Afaan Oromo on a feature phone" | Limited Oromo, needs a smartphone app | Voice-first in am/om/en, on web now and on Telegram, WhatsApp and IVR later, with helper mode | L |
| "Is my business investor-ready?" | A generic checklist | A deterministic Funding Readiness Score from evidence grades and ledger history, plus a deal room | D, N |
| "I already use ChatGPT or Claude" | — | A **BizzAgent connector (MCP)**: verified knowledge, calculators, opportunity search and, with consent, the Business File, metered from the wallet | K, D |

## 3. The moat test

**A feature ships only if it uses at least one of these:**

1. **K: Verified local knowledge.** Human-verified country packs with citations.
2. **D: Persistent business data.** Ledger, statements, artifacts and their history.
3. **N: Network.** Funders, programmes, advisors and peers on the platform.
4. **R: Real-world rails.** Verification, submission, booking, payments and documents that
   others accept.
5. **L: Local access.** Amharic and Afaan Oromo voice, local channels, the EC calendar, birr,
   low literacy.
6. **H: Human experts.** Vetted professionals who review and stamp.

"Chat about X" features that any assistant does equally well are **not** built standalone. They
exist only as steps inside a moat feature. Feature proposals must name their moat in the
[feature catalog](feature-catalog.md).

## 4. Unique features

| Feature | What it does |
|---|---|
| **Verified Business Passport** | A consented, portable profile showing which facts are established and by what: licence check, ledger, expert stamp or field visit. Shared by link or QR with an expiry. The viewer sees the evidence grade per field. |
| **Common Application** | Apply once, reach many. The Business File maps onto each call's form (`CallConfig.field_map`), with per-funder gaps side by side. |
| **Funding Readiness Score** | Deterministic and explainable: evidence grades, ledger months, document completeness, legal status and contradictions. Shows the top 3 actions that raise it. |
| **Statement and receipt import** | Mobile-money and bank exports, plus receipt photos, feed the ledger. This turns *unverified* sales into *established* figures. Formats are verified before parsers are written. |
| **Expert Stamp marketplace** *(later)* | Vetted lawyers, accountants and BDS advisors add an `expert_review` stamp, paid from the wallet. "The agent does 80%, a professional stamps the 20%." |
| **Field verification booking** *(later)* | A partner field officer's checklist becomes `established` evidence. |
| **Tamper-evident documents** | Every export carries a content hash and a QR code linking to a public verify page. |
| **Peer benchmarks** *(later)* | Opt-in and anonymised, with k-anonymity ≥ 10 per cell. A cell is hidden if fewer businesses contribute. |
| **Funder outcome intelligence** *(later)* | Acceptance rates, award sizes and rejection themes from on-platform data. |
| **MCP connector** | Tools for knowledge search, calculators, opportunity search, the Business File (scoped and consented) and Passport sharing. |
| **Always-on watchers** | Opportunity, compliance, competitor, price and deadline watchers, inside consented scopes. |
| **Deal room** *(later)* | A consented investor data room with view tracking and revocation. |
| **Registry checks** *(later)* | Only where an official public registry or API exists. Never assumed. |
| **Community circles** *(later)* | Peer groups, mentor office hours, equb and cooperative tools. |

See [ADR-0028](../architecture/adr/0028-moat-test-and-connector.md).
