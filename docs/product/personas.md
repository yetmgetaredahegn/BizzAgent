# Personas

> **What this is:** the people BizzAgent is designed for. **All personas are fictional.**
> **Who reads it:** product, design, engineers writing fixtures and evals.
> **Last reviewed:** 2026-10-02

Fixtures in `web/src/lib/fixtures` and `backend/seeds` reuse these names. Never use real people
or real businesses in fixtures.

| Persona | Workspace type / legal form | Situation | Needs | Primary language |
|---|---|---|---|---|
| **Almaz Wolde**, 54, spice mill, Bekoji Tera | `business` / `sole_proprietorship` | Feature phone; her son Dawit forwards voice notes; paper licence; 8 staff, 6 women | Funding proposal, numbers explained, Dawit acting as a **helper** with consent | Afaan Oromo, Amharic |
| **Nahom Tadesse**, 28, electronics repair, Addis Ababa | `business` / `sole_proprietorship` | Android, decent English; guesses his numbers | Real margin and cash flow, loan readiness, proposals to several funders | English |
| **Hiwot Alemu**, 26, training and job placement | `collective` or `business`, undecided | Trains young people for free and earns when graduates are placed | Idea and market validation, impact framing, legal form for a social enterprise | Amharic |
| **Selam Bekele**, 22, student with an idea | `explorer` | Telegram user, no business yet | What a PLC or sole proprietorship is, how to register, whether the idea is viable, start-up cost | Amharic, English |
| **Meron Haile**, 35, garment maker, Hawassa | `business` / `plc`, 3 shareholders | 25 staff | Export orders, tenders, an investor, hiring a production supervisor, KPIs her co-founders trust | Amharic, English |
| **Abel Girma**, 30, software studio, Addis Ababa | `business` / `one_member_plc` | Technical, not business-minded | Pricing, cash flow, hiring two developers, accelerators and hackathons, separating personal and company money | English |
| **Ruth**, grants officer at the fictional *Highland Enterprise Fund* | `partner` / `funder` | Publishes calls and reviews proposals | A configurable call, a ranked shortlist with reasons, verifiable documents | English |
| **Daniel**, programme manager at a fictional accelerator | `partner` / `program` | Runs cohorts | Publish an opportunity, receive applications on-platform | English |
| **Tigist**, BDS advisor at a fictional support organisation | `partner` / `support_org` | Coaches 40 small businesses | A consented view of client files, hand-offs from the agent, expert stamps | Amharic |

## Design implications

- **Almaz.** Everything must work by voice, with audio for every prompt and no reading
  required. The helper role exists for Dawit.
- **Nahom.** Numbers must show their working, and the sources of his guessed inputs are labelled
  `user_voice` (unverified).
- **Selam.** Plain definitions of every business term (TermTooltip) and the
  [learn domain](feature-catalog.md).
- **Meron.** Roles matter: co-founders, a finance role and a signatory rule.
- **Abel.** The private personal space, and launch readiness for a tech MVP.
- **Partners.** A separate portal shell, versioned call configurations, and reviewers scoped to
  their own organisation.
