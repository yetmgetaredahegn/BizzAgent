# Feature catalog

> **What this is:** every BizzAgent feature, which domain it belongs to, which moat it uses and when it ships.
> **Who reads it:** product, design, engineering leads.
> **Last reviewed:** 2026-10-02

The moats (see [differentiation](differentiation.md#3-the-moat-test)) are:

| Code | Moat |
|---|---|
| **K** | verified local Knowledge |
| **D** | persistent business Data |
| **N** | Network |
| **R** | real-world Rails |
| **L** | Local access |
| **H** | Human experts |

## 1. Domains (information architecture)

| Domain | Features |
|---|---|
| **Learn** | glossary, learn mode, document explainer, "what does this mean?" everywhere |
| **Start** | business setup, launch readiness (MVP), compliance calendar, document drafting |
| **Validate & plan** | idea clarifier, idea validation, market research, business plan / pitch |
| **Run & grow** | numbers coach, voice ledger, pricing, scenario simulator, loan readiness, growth coach |
| **Money** | business finance, personal finance (private), owner's pay |
| **Team** | members & roles, hiring, onboarding, payroll, resource finder |
| **Fund & opportunities** | opportunity scout, funding proposals, accelerator & investor coach, readiness score, Common Application, Passport |
| **Reach markets** | market entry (local and global), partner and distributor finder, trade fairs |
| **Connect** | advisors, helpers, funder and programme portals, MCP connector |
| **Account** | wallet & usage, memory ("What BizzAgent knows"), language, consent, autonomy, standing instructions |

The **journey planner** sits on top of all domains. **Missions** combine features across domains.

## 2. Built in this release (PRs C1–C6, F, D)

| Feature | Domain | Moats | PR |
|---|---|---|---|
| Accounts, workspace types, 15 roles, consent | Account | D | C1 |
| Wallet, top-up, metering, estimates, refunds | Account | R | C1 |
| Calculators with step traces | Run & grow | D | C1 |
| Proposal rules (config-driven per call) | Fund | N R | C1 |
| Country knowledge packs (cited) | Learn / Start | K | C1 |
| i18n: 3 locales, EC calendar, number words | all | L | C1 |
| Concierge, voice I/O, language switch | all | L | C2 |
| Onboarding interview, learning memory, AI-history import | Account | D | C2 |
| Missions, inbox, autonomy L0–L3, standing instructions, verifiers, activity log | all | D R | C2 |
| Numbers coach | Run & grow | D | C3 |
| Business setup | Start | K H | C3 |
| Launch readiness (tech MVP) | Start | K | C3 |
| Idea clarifier + idea validation | Validate | D | C3 |
| Market research with a global vs local lens | Validate | K | C3 |
| Document explainer | Learn | K L | C3 |
| Funding proposal | Fund | N R | C3 |
| Exports (DOCX/PDF/XLSX/JSON), tamper-evident + verify page | Fund | R | C3 |
| Opportunity catalogue, scout, scam guard, pipeline | Fund | N K | C4 |
| Common Application, Readiness Score, Business Passport | Fund | N D R | C4 |
| Funder-panel simulation | Fund | N | C4 |
| Accelerator & investor coach | Fund | N | C4 |
| Market entry | Reach markets | K | C4 |
| Journey planner + watchers (opportunity, deadline, weekly check-in) | all | D | C4 |
| Hiring & resources (fair screening) | Team | K D | C5 |
| Money coach (business ledger + private personal space) | Money | D | C5 |
| Growth coach, monthly-close mission, ledger anomaly watcher | Run & grow | D | C5 |
| Statement & receipt import | Money | D R | C6 |
| MCP connector | Connect | K D N | C6 |
| Clickable prototype of every screen | web | — | F |
| Web on API v1 | web | — | D |

## 3. Designed now, built later (priority order)

The moat features come first:

| # | Feature | Moats |
|---|---|---|
| M1 | Expert Stamp marketplace | H R |
| M2 | Field verification booking | H R |
| M3 | Peer benchmarks (opt-in, k ≥ 10) | D N |
| M4 | Funder outcome intelligence | N |
| M5 | Deal room | N R |
| M6 | Registry checks (only where official APIs exist) | R K |
| M7 | Community circles | N L |

Then:

1. Voice ledger
2. Proactive check-ins over Telegram, then WhatsApp, then IVR/USSD
3. Pitch builder and pitch rehearsal
4. Investor readiness and cap table
5. Compliance calendar (EC + GC)
6. Loan readiness
7. Business plan builder
8. Pricing and costing assistant
9. Scenario simulator
10. Partner, supplier and distributor finder
11. Tender monitor
12. Document drafting (invoices, quotations, MoA templates)
13. Learn mode
14. Advisor hand-off and helper mode improvements
15. Impact tracker
16. Price watch
17. Savings groups and cooperatives
18. Customer discovery agent
19. Competitor monitor
20. Weekly business review
21. Negotiation coach
22. Marketing content assistant
23. Grant reporting assistant
24. Co-founder and mentor matching
25. MVP site generator

Each of these must pass the moat test before it is scheduled. Pure "chat about X" features exist
only as steps inside a moat feature.
