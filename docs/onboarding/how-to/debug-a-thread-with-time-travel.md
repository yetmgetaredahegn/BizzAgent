# How to debug a thread with time travel

> **What this is:** inspecting and replaying a conversation or mission thread (PR C2 onward).
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

```python
from bizzagent.agents.concierge import build_concierge
from bizzagent.agents.checkpointer import checkpointer

graph = build_concierge(deps, checkpointer=checkpointer())
cfg = {"configurable": {"thread_id": "<conversation or mission id>"}}

state = graph.get_state(cfg)           # current values + next nodes + pending interrupts
for snap in graph.get_state_history(cfg):
    print(snap.config["configurable"]["checkpoint_id"], snap.next, snap.values.get("active_skill"))

# Replay or fork from an earlier checkpoint
past = {"configurable": {"thread_id": "...", "checkpoint_id": "<id>"}}
graph.update_state(past, {"language": "am"}, as_node="set_language")  # fork with an edit
```

- Use `uv run langgraph dev` and Studio to view the same thread visually.
- Never edit production threads by hand. Fork into a copy instead.
