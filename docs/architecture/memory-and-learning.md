# Memory and learning

> **What this is:** how BizzAgent remembers and learns. Long-term memory, the learning loop, the onboarding interview, AI-history import, and the memory UI.
> **Who reads it:** engineers working on the concierge and memory, designers of Settings → Memory.
> **Last reviewed:** 2026-10-02

Decisions: [ADR-0013](adr/0013-memory-in-langgraph-store.md),
[ADR-0025](adr/0025-learning-memory-and-import.md). Requirements: `FR-MEM-*`.

## 1. Where memory lives

| Kind | Where | Lifetime |
|---|---|---|
| Short-term (this conversation) | Graph state, checkpointed per `thread_id` | The thread |
| Profile | LangGraph Store namespace `("users", user_id)`: language, name, phone hash, consent flags, preferences | Until forgotten |
| Business facts | Store namespace `("business", workspace_id)`: a collection of `MemoryItem`s with a semantic index | Until forgotten |
| Policies | Store namespace `("policies", workspace_id)` | Until changed |
| Artifacts | App DB (versioned, with provenance) | Business record |

```python
class MemoryItem(BaseModel):
    text: str                      # in the user's language
    structured: dict | None        # e.g. {"employees": 8}
    provenance: Provenance         # source: user_voice | user_text | imported | ...
    confidence: float | None
    created_from: str              # thread_id / import_id
    confirmed_at: datetime | None  # None = candidate, never used
```

## 2. The learning loop

```mermaid
flowchart LR
  T[turn finished] --> X[memory_extractor<br/>LLM structured] --> D[dedupe / merge<br/>vs existing]
  D --> C((read-back: "Should I remember<br/>you have 8 employees?"))
  C -->|yes| S[(Store)]
  C -->|no| Drop[discard]
```

- **Only confirmed items are used.** They enter skills as provenance `remembered` (unverified) and
  are **re-confirmed** before they enter any official document.
- Candidates are batched, at most 3 per confirmation prompt, so learning never nags.
- "Pause learning" stops extraction entirely.

## 3. The onboarding interview

- A sub-graph with a question plan driven by profile gaps (the workspace type decides which
  gaps matter).
- One interrupt per question. Each question offers voice or text, "explain", "I don't know",
  and skip. Every answer is read back.
- It finishes early whenever the user wants. Takes 5–10 minutes; never blocking.

## 4. AI-history import

Users bring their context from Claude, ChatGPT or Gemini, so nobody starts from zero.

1. **Copy-paste prompt** in 3 languages. The prompt asks the other assistant to output a
   structured summary: business, goals, skills, constraints, numbers, documents mentioned. The
   user pastes the result into BizzAgent.
2. **Export-file upload.** One parser per format. **The formats must be verified against real
   exports at implementation time**; nothing here asserts their structure.
3. Both go through the same extractor → candidates → **user review** screen.
4. Provenance is `imported`, never `established`. Raw uploads are deleted after extraction.
   Nothing is shared.

## 5. Memory UI ("What BizzAgent knows")

- A list by topic, source and date. Each item shows its provenance stamp.
- Edit, **forget** (a hard delete from the Store and any derived index), export as JSON, and
  pause learning.
- Import entry point, plus the review queue for imported candidates.

## 6. Tests

- An unconfirmed candidate is never used.
- Forget is a hard delete.
- Imported items are `imported` and unverified.
- The raw upload is gone after extraction.
- A remembered fact needs read-back before it enters a document.
