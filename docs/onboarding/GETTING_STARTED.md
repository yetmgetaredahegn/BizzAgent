# Getting started

> **What this is:** setting up BizzAgent locally and making a first change. Target: 15 minutes.
> **Who reads it:** new contributors.
> **Last reviewed:** 2026-10-02

## 1. Prerequisites

- Git
- [uv](https://docs.astral.sh/uv/) (it installs Python 3.13 for you)
- Node.js 22 or later, and npm
- Optional, for real local models: [Ollama](https://ollama.com)

## 2. Clone

```bash
git clone https://github.com/yetmgetaredahegn/bizzagent.git
cd bizzagent
```

## 3. Backend

```bash
cd backend
cp .env.example .env
uv sync --group dev
uv run pytest -q                                   # 3 passed
uv run uvicorn bizzagent.main:app --reload         # http://127.0.0.1:8000/docs
```

The lightweight install runs no AI models. To try the legacy voice interview or the licence OCR
locally:

```bash
uv sync --group dev --extra speech --extra vision --extra llm-local
ollama pull llama3.1:8b
```

Ollama is for local testing only. Production uses hosted model APIs configured through
environment variables ([ADR-0006](../architecture/adr/0006-pluggable-llm-per-role.md)). Never
commit keys.

**Coming with later PRs** (these commands don't exist yet):

| Command | Arrives in |
|---|---|
| `uv run bizzagent seed` | C1 |
| `BIZZAGENT_ENV=test uv run uvicorn …` (fake providers) | C2 |
| `uv run langgraph dev` (Studio) | C2 |

## 4. Web

In a second terminal:

```bash
cd web
npm install
cp .env.example .env.local
npm run dev                                        # http://localhost:3000
```

The demo cases and the reviewer batch work without the backend. `/apply` calls the backend.

## 5. Checks before you push

```bash
cd backend && uv run ruff check && uv run ruff format --check && uv run mypy src && uv run pytest -q
cd web && npm run lint && npm test && npm run build
```

## 6. Your first change

1. Read [ENGINEERING_RULES](../engineering/ENGINEERING_RULES.md) and the
   [CODEBASE_TOUR](CODEBASE_TOUR.md).
2. Create a branch: `git checkout -b fix/<short-name>`.
3. Make the change, add a test, and update any doc it affects.
4. Commit with a Conventional Commit message and open a PR using the template.

## 7. Next

- [LangGraph primer](LANGGRAPH_PRIMER.md)
- [How-to guides](how-to/)
- [Glossary](GLOSSARY.md)
