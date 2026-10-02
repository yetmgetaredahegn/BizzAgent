# BizzAgent

A voice-first business agent for founders, teams and small businesses, Ethiopia
first. BizzAgent helps people understand legal forms and registration, validate
an idea, do the numbers, find funding and opportunities, and turn what they say
into documents they can submit. It works in Amharic, Afaan Oromo and English.
Every value it shows says where it came from; anything it cannot establish is
flagged, never guessed.

Formerly FundFlow, a hackathon prototype for turning a voice note into a funding
proposal. That work is now BizzAgent's funding skill; the original brief is in
[`docs/archive/`](docs/archive/origin-hackathon-challenge.md).

## Repository layout

| Path | What it is |
| --- | --- |
| `web/` | Next.js 16 web client: landing page, applicant path, reviewer dashboard |
| `backend/` | FastAPI service, package `bizzagent` (src layout, managed with uv) |
| `backend/tests/fixtures/` | Sample licence and workshop photos used by tests |
| `docs/` | Product and engineering documentation (in progress) |

## Run the web app

```bash
cd web
npm install
cp .env.example .env.local   # points at the FastAPI backend
npm run dev                   # http://localhost:3000
```

The demo cases (Almaz, Nahom, Hiwot) and the 12-application reviewer batch work
without the backend. The live applicant flow (`/apply`) needs the backend.

Checks: `npm run lint`, `npm test`, `npm run build`.

## Run the backend

```bash
cd backend
cp .env.example .env
uv sync --group dev
uv run uvicorn bizzagent.main:app --reload   # http://127.0.0.1:8000
```

Local models are optional extras, loaded on first use:

```bash
uv sync --group dev --extra speech --extra vision --extra llm-local
```

The legacy voice interview needs Ollama with `llama3.1:8b` pulled. Ollama is for
local testing only; production uses hosted model APIs configured through
environment variables. Allowed browser origins come from
`BIZZAGENT_FRONTEND_ORIGINS`.

Checks: `uv run ruff check`, `uv run ruff format --check`, `uv run mypy src`,
`uv run pytest`.

## Principles

- **Evidence over guessing.** Every field is established, unverified, missing
  or contradictory, and shows where it came from.
- **Rules, not the model, do the arithmetic.** Calculations, eligibility and
  scoring are deterministic code.
- **Declarations are explained, never ticked.** BizzAgent records that the
  user understood; only the user ticks.

All people and businesses in the demo data are fictional. The scoring grid and
declaration wording are illustrative until replaced with each funder's official
versions.
