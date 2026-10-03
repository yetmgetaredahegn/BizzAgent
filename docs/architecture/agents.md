# Agents and skills

> **What this is:** one section per skill: purpose, agent card, state, nodes, tools, interrupts, outputs, honesty rules and evals.
> **Who reads it:** engineers building or changing a skill. Read the [operating model](agent-operating-model.md) first.
> **Last reviewed:** 2026-10-02

Conventions for every skill:

- **Layout.** A skill lives in `bizzagent/agents/skills/<name>/` with `state.py`, `graph.py`,
  `nodes.py` and prompt ids in `llm/prompts/`.
- **Compilation.** It is compiled as a sub-graph and added to the concierge as a node.
- **Hand-back.** It returns with `Command(goto="summarise", graph=Command.PARENT, update=...)`.
- **Asking the user.** All user questions go through `agents/common/ask.py` (`ask`, `readback`,
  `approve`), which wraps `interrupt()` with the 3-language turn options.
- **Arithmetic.** All numbers come from `bizzagent.calc`; all eligibility and scoring from
  `bizzagent.rules`.
- **Verification.** Every user-visible output passes the verifier chain.

[LangGraph primer](../onboarding/LANGGRAPH_PRIMER.md) module references are given as [M1]…[M6].

---

## Concierge (supervisor)

| Card | |
|---|---|
| Goal | Understand the user's goal in their language and get it handled by the right skill or mission |
| Triggers | Every user turn; session start |
| Autonomy | Routing is automatic. It never takes consequential actions itself |
| Tools | Intent router, Store (profile, memory), journey planner |
| Approvals | — |
| Outputs | Summaries, memory candidates, routing |
| Evals | `concierge/first_contact_{am,om,en}`, `concierge/unknown_request`, `concierge/language_switch` |

**State:** `ConciergeState(MessagesState)` + `language`, `workspace_id`, `active_skill`,
`pending` (the current interrupt prompt key), `artifacts_index`, `summary` [M1, M2].

**Nodes:**

1. `greet` (load profile [M5])
2. `choose_language` (interrupt [M3])
3. `understand` (voice_io + intents, trim/summarise [M2])
4. `route` (structured output + deterministic table [M1 router])
5. skill sub-graphs [M4]
6. `reply`
7. `verify`
8. `summarise` (+ `memory_extractor`)
9. `speak`
10. `wait` (interrupt)

**Honesty:** for an unknown request it says "I don't know" and offers a human. It never
improvises facts.

## Voice I/O (shared sub-graph)

- `listen`: ASR per language [M1 router]. Low confidence leads to a "please repeat" prompt or a
  text fallback.
- `speak`: TTS per language; text is always shown too.
- Stage events go through `get_stream_writer()` [M3 streaming], for example
  `{"stage":"transcribing","text_key":"stage.transcribing"}`.

## Onboarding interview

Profile-gap question plan; one interrupt per question; early exit. Output: `BusinessProfile` v1
and confirmed memory. See [memory](memory-and-learning.md#3-the-onboarding-interview).

## Numbers coach

| Card | |
|---|---|
| Goal | A correct number with its working, from sourced inputs |
| Triggers | Intent `numbers`; hand-off from setup, growth or money |
| Autonomy | L1 |
| Tools | `calc.*` via `ToolNode` [M1 agent] |
| Outputs | `FinancialSheet` |
| Evals | `numbers/margin_voice`, `numbers/loan_flat_vs_declining`, `numbers/what_if_fork` |

**Nodes:**

1. `choose_calculator`
2. `ask_input` (loop, with "why we ask")
3. `readback`
4. `compute` (calc tool)
5. `render_steps` (localised ReceiptTape)
6. `save_sheet`
7. `offer_what_if` (time-travel fork [M3])

**Honesty:** every input has a source. The rules verifier asserts that each number shown equals
the `Result` value.

## Business setup

| Card | |
|---|---|
| Goal | A legal-form recommendation and a registration checklist, every legal point cited |
| Autonomy | L0 for the decision, L1 for the checklist |
| Tools | `rules.setup_rules`, `knowledge.retrieve` |
| Outputs | `LegalSetupPlan` (+ PDF) |
| Evals | `setup/plc_vs_sole_cited`, `setup/uncited_question_refused` |

**Nodes:** `interview` (owners, liability, capital, sector, foreign participation, licence needs)
→ `recommend` (rules) → `retrieve` → `answer_grounded` → `checklist` → `export`.

**Honesty:** no citation, no claim. Every answer shows "not legal advice" and offers an advisor.

## Launch readiness

**Nodes:** `classify_product` → `pack_checklist` (cited, or "no verified answer") →
`tech_checklist` → `LaunchChecklist`. Evals: `launch/pre_registration_uncited`.

## Idea clarifier and idea validation

**Nodes:**

1. `clarify`: one-liner, problem, customer, solution, alternatives, positioning, as a new
   `IdeaCanvas` version
2. `approve` (interrupt; a diff against the previous version)
3. `assumptions` (rubric-scored)
4. `experiments`
5. `interview_script` (in the user's language)
6. `log_results` (voice)
7. `update_confidence` (pure)

**Outputs:** `IdeaCanvas`, `ValidationPlan`, `EvidenceBoard`. **Honesty:** assumptions stay
labelled until tested.

## Market research

| Card | |
|---|---|
| Goal | A cited market report with a global vs local lens |
| Autonomy | L1; the research spend shows a CostTicket |
| Tools | `search` provider, `calc` (sizing) |
| Outputs | `MarketReport` |
| Evals | `market/fact_without_url_dropped`, `market/search_none_asks_user` |

**Nodes:** `plan_queries` → `Send("analyst", …)` for each global and local competitor or segment
[M4 map-reduce, research-assistant] → `extract_facts` (URL + `retrieved_at`) → `reduce` (dedupe,
SWOT, price table, localisation gap) → `sizing` (calc over confirmed assumptions).

## Funding proposal

| Card | |
|---|---|
| Goal | An evidence-grounded proposal for a call or directory entry, ready to submit or export |
| Autonomy | L1 for drafting, L2 for submit (always an approval) |
| Tools | OCR/VLM, ASR, `rules.*` with the pinned `CallConfig`, exports |
| Approvals | Submit; every declaration tick is the user's own action |
| Outputs | `Proposal`, `Document`s |
| Evals | `funding/almaz_om`, `funding/contradiction_kept`, `funding/declaration_not_auto_ticked` |

**State:**

- `evidence` (append-only reducer)
- `discarded`
- `fields` (merge reducer)
- `contradictions`, `gaps`, `evaluation`
- `turns`, `drafts`
- `declarations` (reducer accepts only `actor="user"` events)

**Nodes:**

1. `ingest`
2. `media` sub-graph: `transcribe` ‖ `read_licence` ‖ `observe_workshop` [M4 parallel]
3. `extract_claims`
4. `ground_claims` (deterministic: the quote is in the source, and numbers are in the quote)
5. `assess` (merge → contradictions → gaps → evaluate)
6. question loop: `ask` → `process_answer` → `readback`
7. `draft_narratives`, `draft_impact` (`draft_for_approval`)
8. `confirm`
9. `finalize`
10. `submit` or `export`

## Document explainer

**Nodes:**

1. `ocr_layout` (+ VLM)
2. `span_index`
3. `segment_clauses`
4. `extract` (span-cited)
5. `red_flags` (rule library)
6. `normalise_dates_money` (EC/GC)
7. `explain` (user language)
8. `propose_actions`

**Output:** `DocumentExplanation`. **Honesty:** every point has a span and a page; unreadable
regions are reported; "not legal advice".

## Opportunity scout

| Card | |
|---|---|
| Goal | Sourced, eligible, ranked opportunities in the pipeline, with requirements mapped |
| Triggers | User request; weekly `opportunity_watch` job; standing instructions |
| Autonomy | L1 (L3 allowed for scanning and pre-drafting; never for submitting) |
| Outputs | `OpportunityPipeline` items |
| Evals | `scout/no_url_rejected`, `scout/expired_hidden`, `scout/scam_fee_flagged` |

**Nodes:**

1. `profile_snapshot`
2. `plan_queries`
3. `Send` per (type, source)
4. `collect`
5. `dedupe`
6. `eligibility` (pure)
7. `rank` (pure)
8. `explain_fit` (grounded)
9. `ask` (pick)
10. `add_to_pipeline`
11. `schedule_reminders`

## Accelerator and investor coach

**Nodes:**

1. `fetch_programme` (cited)
2. `extract_questions_limits` (grounded)
3. `readiness` (rubric)
4. `draft_answers` (artifact-grounded, limit-checked)
5. `video_script`
6. `mock_interview` (voice interrupts, rubric feedback)
7. `track`

## Market entry

**Nodes:**

1. `choose_target`
2. `research` (`Send`)
3. `confirm_indicators`
4. `attractiveness` (pure)
5. `entry_mode` (rules)
6. `cost_to_enter` (calc)
7. `requirements` (cited or TODO)
8. `plan` → `MarketEntryPlan` + DOCX

## Journey planner

A pure stage model (idea → validated → formalised → operating → growing → funded → expanding)
and `next_best_actions(state) -> list[Action]` (at most 3, each with a reason and a skill). It
also has a phrasing node and the `weekly_checkin` job.

## Hiring and resources

**Nodes:**

1. `define_role`
2. `draft_jd` (3 languages, approval)
3. `posting_texts`
4. `collect_applications` (CV or voice)
5. `screen`: a rubric over job-related criteria. The LLM only extracts quotes per criterion.
   Protected attributes are stripped before extraction.
6. `interview_kit`
7. `offer` (cited template)
8. `onboarding_checklist`
9. `payroll_setup` (calc with cited rates, or TODO)

The resource finder runs as a search sub-graph (URL-or-drop).

## Money coach

- **Business:** ledger → statements, cash position and KPIs (calc).
- **Personal:** runs only in the personal space: budget, goals, net worth, owner's pay.
- Answers "can I afford…" with a calculation trace. It never reads workspace data from the
  personal space, or the reverse, without an explicit user share.

## Growth coach

A growth plan (objectives, ledger KPIs, initiatives) with links to the scout, market entry and
hiring. A weekly review loop and the `ledger_anomaly` watcher.

## Mission core (`agents/core`)

`missions.py` (planner + validator + executor with `Send`), `inbox.py`, `policy.py` (pure),
`verifiers.py`, `activity.py`. See [agent-operating-model](agent-operating-model.md).
