# FundFlow

From a voice note to a fundable proposal. FundFlow turns a spoken story, phone
photos and a paper licence into a complete, honest funding application for
small Ethiopian businesses. It also gives reviewers a ranked shortlist they can
defend. Every field it cannot establish is flagged, never guessed.

Built for sequa gGmbH (Challenge 1: *From a voice note to a fundable proposal*).

## Repository layout

| Path | What it is |
| --- | --- |
| `web/` | Next.js 16 web app: landing page, applicant path, reviewer dashboard |
| `backend/` | FastAPI service: licence OCR check, voice interview (Whisper, Ollama, Kokoro) |
| `frontend/` | Streamlit developer harness for the voice interview |
| `docs/` | Challenge brief |
| `demo/images/` | Sample licence and workshop photos |

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
uv sync
cd backend
uv run uvicorn app.main:app --reload   # http://127.0.0.1:8000
```

The interview agent needs Ollama with `llama3.1:8b` pulled. The browser app's
origin must be allowed by CORS: set `FRONTEND_ORIGINS` (comma-separated,
default `http://localhost:3000,http://127.0.0.1:3000`).

## Principles

- **Evidence over guessing.** Every field is established, unverified, missing
  or contradictory, and shows where it came from.
- **Rules, not the model, do the arithmetic.** Eligibility, exclusions and the
  weighted grid are deterministic code.
- **Declarations are explained, never ticked.** FundFlow records that the
  applicant understood; only the applicant ticks.

All people and businesses in the demo data are fictional. The scoring grid and
declaration wording are illustrative until replaced with sequa's official versions.
