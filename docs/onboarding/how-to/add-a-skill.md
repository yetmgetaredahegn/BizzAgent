# How to add a skill

> **What this is:** the steps to add a new LangGraph skill. Skills exist from PR C2 onward.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. **Pass the moat test.** Name the moat in the [feature catalog](../../product/feature-catalog.md).
2. **Write the agent card** in [agents.md](../../architecture/agents.md): goal, triggers,
   autonomy, tools, approvals, outputs, honesty rules and evals. Add `FR-…` IDs to the
   [SRS](../../requirements/SRS.md) and rows to the
   [traceability](../../requirements/traceability.md) table.
3. **Create the package** `backend/src/bizzagent/agents/skills/<name>/`:
   - `state.py`: input, output and private state schemas (JSON-serialisable)
   - `nodes.py`: small verb-named nodes. Use `ask`/`readback`/`approve` from
     `agents/common/ask.py` for user questions.
   - `graph.py`: `build_graph(deps) -> CompiledStateGraph`. Finish with
     `Command(goto="summarise", graph=Command.PARENT, update=...)`.
4. **Keep the arithmetic and rules out of the graph.** Put them in `calc`/`rules`, as pure
   functions with tests.
5. **Add prompts** as `llm/prompts/<skill>.<step>.md`, versioned. Add locale keys in 3
   languages.
6. **Register** the intent in the concierge routing table, and the graph in `langgraph.json`.
7. **Add tests** with `Deps.fake()`: the happy path in en/am/om, "I don't know", and the
   honesty invariants. Add golden eval cases.
8. **Add screens and states** in [ux-spec](../../design/ux-spec.md) and endpoints in
   [api.md](../../engineering/api.md) if needed.
