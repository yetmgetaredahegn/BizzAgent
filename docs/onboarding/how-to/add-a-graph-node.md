# How to add a graph node

> **What this is:** adding a node to an existing graph safely.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. **One responsibility, named by verb.** Return a partial state update; never mutate state.
2. **LLM nodes:** structured output into a Pydantic model, a `RetryPolicy`, and a deterministic
   fallback.
3. **Asking the user:** use `ask()` (it wraps `interrupt()`). Put side effects **after** the
   interrupt, or make them idempotent. The node re-runs from the top on resume.
4. **Stage text:** call `get_stream_writer()({"stage": key})` with a locale key.
5. Wire the edges; for routing, use conditional edges with an explicit destination list.
6. **Test** by invoking up to the interrupt, resuming with `Command(resume=…)`, and asserting
   on state and verifier results.

See the [LangGraph primer](../LANGGRAPH_PRIMER.md#2-cheatsheet-verified-snippets).
