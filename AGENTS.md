# Rules for AI coding assistants

Follow [docs/engineering/ENGINEERING_RULES.md](docs/engineering/ENGINEERING_RULES.md), [docs/architecture/module-conventions.md](docs/architecture/module-conventions.md), and [docs/architecture/dependency-rules.md](docs/architecture/dependency-rules.md).

## Core Directives for All Sessions

- **Protect the frontend**: The frontend (`web/`) is strictly read-only unless the user explicitly authorizes modifications to it.
- **Follow architecture documents**: Read and adhere to `docs/architecture/` before changing code; update documentation in the same change.
- **Maintain modular structure**: The backend is a modular monolith ([modules](docs/architecture/modules.md)). Import other modules only through their package root (`bizzagent.modules.<name>`); `uv run lint-imports` must pass.
- **Consistent file naming & boundaries**: Follow the standard module file names (`router.py`, `schemas.py`, `models.py`, `service.py`, `repository.py`, `rules/`, `dependencies.py`, etc.) and adhere to layer boundaries in `docs/architecture/dependency-rules.md`.
- **Implement endpoints only alongside capabilities**: Do not create speculative or empty endpoints. Endpoints are added only when the underlying service capability is implemented.
- **Incremental feature implementation**: Implement normal application features, services, and database persistence incrementally alongside their use cases.
- **Incremental agent development**: Implement agents, skills, and LangGraph workflows incrementally when their corresponding capabilities are developed, not ahead of time.
- **Avoid speculative code**: Do not introduce speculative files, empty endpoints, dummy business logic, or unnecessary abstraction layers.
- **Add tests with each implementation**: Add relevant unit, service, and router tests under `backend/tests/modules/<name>/` with each implementation.
- **Inspect Git status**: Check Git status before and after changes; preserve unrelated user work.
- **Run checks & report factual results**: Execute relevant linters, type checks, and tests (`uv run ruff check`, `uv run mypy src`, `uv run lint-imports`, `uv run pytest`), reporting actual results without exaggeration.
- **Maintain the canonical handoff**: Update the single canonical handoff document ([backend/handoff.md](backend/handoff.md)) at the end of every run (including incomplete or blocked runs).

## Coding & Domain Invariants

- `calc`, `knowledge` and every module's `rules/` are pure Python: no LLM, LangChain or LangGraph imports.
- Numbers come from `calc`; eligibility and scoring from the owning module's `rules/`. The model is never a provenance source.
- Never invent legal, tax, market or opportunity facts. Cite a source, or write `TODO(source needed)`.
- Use LangGraph 1.x APIs (`interrupt`, `Command`, `Send`, `get_stream_writer`, `context_schema`).
- No hard-coded user-facing strings; add `en`, `am` and `om` locale keys.
- Fixtures use fictional people only. No secrets.
- Commits and PRs are authored by the human contributor. Add no AI co-author trailers or "generated with" lines.
- For the Next.js app, read `web/AGENTS.md` when authorized to work on the frontend.
