# LangGraph primer for BizzAgent

> **What this is:** the LangChain Academy *Intro to LangGraph* course, mapped to current LangGraph 1.x APIs and to where BizzAgent uses each concept.
> **Who reads it:** every engineer before touching `bizzagent.agents`.
> **Last reviewed:** 2026-10-02. All snippets were run against langgraph 1.2.11.

The course ([academy.langchain.com](https://academy.langchain.com/courses/intro-to-langgraph))
has six modules. Some of its notebooks use older APIs. **Use the 1.x forms shown here:**

| Course API | 1.x replacement |
|---|---|
| `interrupt_before` / `NodeInterrupt` | `interrupt()` + `Command(resume=…)` |
| `create_react_agent` | `langchain.agents.create_agent`, where a tool-calling agent is wanted |
| Handoff by state flags | `Command(goto=…, graph=Command.PARENT)` |

## 1. Course module → concept → BizzAgent usage

| Module | Concept | BizzAgent usage |
|---|---|---|
| M1 simple graph / chain | `StateGraph`, nodes, edges | Every skill |
| M1 router | Conditional edges | Language routing, intent routing, grid routing |
| M1 agent / agent memory | Tools, checkpointer threads | Calculators as tools in the numbers coach; thread = conversation |
| M2 state schema / reducers | TypedDict and Pydantic, `operator.add`, custom reducers | Artifacts merged by key, append-only evidence, a declaration reducer that rejects non-user ticks |
| M2 multiple schemas | Private state, input and output schemas | Skill-internal scratch vs the concierge view |
| M2 trim / summarise / external memory | Message trimming, summaries, `SqliteSaver` | Long voice conversations on small models |
| M3 streaming | `stream_mode` updates / custom / messages, `get_stream_writer` | Stage text in the user's language over SSE; the activity log |
| M3 breakpoints / dynamic breakpoints | **`interrupt()` + `Command(resume)`** | Questions, read-back, approvals (inbox) |
| M3 edit state | `update_state(as_node=…)` | Language switch, user edits an artifact, reviewer override |
| M3 time travel | `get_state_history`, forking | "Undo my last answer", what-if forks, mission forks, audit |
| M4 parallelization | Fan-out / fan-in | ASR ‖ OCR ‖ VLM in the funding media step |
| M4 sub-graph | Sub-graphs with their own state | Each skill |
| M4 map-reduce | `Send` | Competitor analysts, the opportunity scout, mission executor tasks |
| M4 research assistant | Human-in-the-loop + parallel analysts | Market research (closest analogue) |
| M5 memory store / profile / collection / memory agent | `Store`, namespaces, semantic index | User profile, business facts, policies, knowledge retrieval |
| M6 assistants / double texting / deployment | Configuration per assistant, concurrency, `langgraph.json` | `context_schema` per call or skill; a per-thread lock (409); Studio via `langgraph dev` |

## 2. Cheatsheet (verified snippets)

### Graph, router, reducer, interrupt, stream, edit and history

```python
import operator
from typing import Annotated, TypedDict
from langgraph.checkpoint.memory import InMemorySaver   # SqliteSaver in the app
from langgraph.config import get_stream_writer
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

class S(TypedDict):
    language: str | None
    notes: Annotated[list[str], operator.add]          # reducer: append

def greet(state: S) -> dict:
    return {"notes": ["greeted"]}

def route(state: S) -> str:                            # M1 router
    return "ask_language" if state["language"] is None else "done"

def ask_language(state: S) -> dict:
    get_stream_writer()({"stage": "asking_language"})  # M3 custom stream event
    lang = interrupt({"key": "choose_language", "options": ["am", "om", "en"]})  # M3
    return {"language": lang, "notes": [f"lang={lang}"]}

def done(state: S) -> dict:
    return {"notes": ["done"]}

b = StateGraph(S)
b.add_node(greet); b.add_node(ask_language); b.add_node(done)
b.add_edge(START, "greet")
b.add_conditional_edges("greet", route, ["ask_language", "done"])
b.add_edge("ask_language", "done"); b.add_edge("done", END)
g = b.compile(checkpointer=InMemorySaver())

cfg = {"configurable": {"thread_id": "t1"}}             # always pass a thread_id
out = g.invoke({"language": None, "notes": []}, cfg)  # out["__interrupt__"] holds the prompt
for chunk in g.stream(Command(resume="om"), cfg, stream_mode=["updates", "custom"]):
    ...                                                 # relay to SSE
g.update_state(cfg, {"language": "am"}, as_node="ask_language")  # M3 edit state
history = list(g.get_state_history(cfg))                         # M3 time travel
```

### Map-reduce with `Send`

```python
from langgraph.types import Send

class M(TypedDict):
    competitors: list[str]
    facts: Annotated[list[str], operator.add]

def fan(state: M):
    return [Send("analyst", {"name": c}) for c in state["competitors"]]

def analyst(state: dict) -> dict:
    return {"facts": [f"fact about {state['name']}"]}

mb = StateGraph(M); mb.add_node("analyst", analyst)
mb.add_conditional_edges(START, fan, ["analyst"]); mb.add_edge("analyst", END)
```

### A skill sub-graph handing back to the concierge

```python
def skill_node(state: P):
    return Command(goto="summarise", graph=Command.PARENT, update={"result": "42"})

skill = StateGraph(P); skill.add_node("work", skill_node); skill.add_edge(START, "work")
parent = StateGraph(P)
parent.add_node("numbers", skill.compile(), destinations=("summarise",))
parent.add_node("summarise", summarise)
```

### Store and runtime context (`context_schema`)

```python
from dataclasses import dataclass
from langgraph.runtime import Runtime
from langgraph.store.memory import InMemoryStore   # SQLite/Postgres store in the app

@dataclass
class Ctx:
    country: str

def remember(state: P, runtime: Runtime[Ctx]) -> dict:
    runtime.store.put(("users", "u1"), "profile", {"language": "om"})
    item = runtime.store.get(("users", "u1"), "profile")
    return {"result": f"{runtime.context.country}:{item.value['language']}"}

g = StateGraph(P, context_schema=Ctx)  # …nodes, edges…
g.compile(store=InMemoryStore()).invoke({"result": ""}, context=Ctx(country="et"))
```

## 3. Common mistakes

1. **Side effects before `interrupt()` run again on resume.** The node restarts from the top.
   Move writes after the interrupt, or key them for idempotency.
2. **Non-serialisable state:** datetimes without encoders, open files, model clients. Keep state
   plain; put clients in `Deps` or the runtime context.
3. **Missing `thread_id`.** Without it there is no checkpoint, so no resume and no history.
4. **Mutating state in place** (`state["notes"].append(...)`). Return an update instead.
5. **Several interrupts in one node.** They are matched by order on resume. Prefer one
   interrupt per node.
6. **Letting the model do the arithmetic.** Call `calc` through a tool and render its steps.
7. **Routing on free text.** Use structured output plus a deterministic table, with a fallback
   intent.

## 4. Studio

```bash
cd backend && uv run langgraph dev   # once langgraph.json and langgraph-cli are added in C2
```
