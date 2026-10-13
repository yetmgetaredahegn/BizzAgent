# How to add a skill

> **What this is:** the steps to add a new LangGraph skill. Skills exist from PR C2 onward.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-03

1. **Pass the moat test.** Name the moat in the [feature catalog](../../product/feature-catalog.md).
2. **Write the agent card** in [agents.md](../../architecture/agents.md): goal, triggers,
   autonomy, tools, approvals, outputs, honesty rules and evals. Add `FR-…` IDs to the
   [SRS](../../requirements/SRS.md) and rows to the
   [traceability](../../requirements/traceability.md) table.
3. **Pick the owning module** from [modules.md](../../architecture/modules.md). If no product
   module owns the domain, propose one there first.
4. **Create the agent package** `backend/src/bizzagent/modules/<module>/agent/`:
   - `state.py`: input, output and private state schemas (JSON-serialisable)
   - `nodes.py`: small verb-named nodes. Use `ask`/`readback`/`approve` from `modules.agents`
     for user questions.
   - `graph.py`: `build_graph(deps) -> CompiledStateGraph`. Finish with
     `Command(goto="summarise", graph=Command.PARENT, update=...)`.
   - `prompts/<step>.md`: versioned prompts. Add locale keys in 3 languages.
5. **Keep the arithmetic and rules out of the graph.** Use `modules.calc`, or put rules in the
   module's pure `rules/` package, with tests.
6. **Use other domains only through their public API** (`from bizzagent.modules.funding import
   …`), never their models or repositories.
7. **Register** the graph and its intents with the skill registry in `modules.agents` (from the
   module's package root, called by `main.py`), and add the graph to `langgraph.json`.
8. **Add tests** in `backend/tests/modules/<module>/` with `Deps.fake()`: the happy path in
   en/am/om, "I don't know", and the honesty invariants. Add golden eval cases. Run
   `uv run lint-imports`.
9. **Add screens and states** in [ux-spec](../../design/ux-spec.md) and endpoints in
   [api.md](../../engineering/api.md) if needed.
