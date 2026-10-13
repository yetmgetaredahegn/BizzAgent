# Rules for AI coding assistants

Follow [docs/engineering/ENGINEERING_RULES.md](docs/engineering/ENGINEERING_RULES.md). In short:

- Read the relevant docs before changing code; update them in the same change.
- The backend is a modular monolith ([modules](docs/architecture/modules.md)). Import other
  modules only through their package root; `uv run lint-imports` must pass.
- `calc`, `knowledge` and every module's `rules/` are pure Python: no LLM, LangChain or LangGraph
  imports.
- Numbers come from `calc`; eligibility and scoring from the owning module's `rules/`. The model is never a
  provenance source.
- Never invent legal, tax, market or opportunity facts. Cite a source, or write
  `TODO(source needed)`.
- Use LangGraph 1.x APIs (`interrupt`, `Command`, `Send`, `get_stream_writer`, `context_schema`).
- No hard-coded user-facing strings; add en, am and om locale keys.
- Fixtures use fictional people only. No secrets.
- Commits and PRs are authored by the human contributor. Add no AI co-author trailers or
  "generated with" lines.
- For the Next.js app, also read `web/AGENTS.md`.
