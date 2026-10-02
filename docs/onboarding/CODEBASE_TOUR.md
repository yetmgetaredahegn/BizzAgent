# Codebase tour

> **What this is:** where things are today, and where they are going.
> **Who reads it:** new contributors.
> **Last reviewed:** 2026-10-02

## Today

```
backend/
  pyproject.toml          uv project, package "bizzagent" (src layout), extras: speech, vision, llm-local
  .env.example            BIZZAGENT_* settings
  src/bizzagent/
    main.py               FastAPI app, CORS, routers
    config.py             Settings (pydantic-settings, BIZZAGENT_ prefix)
    routes/applications.py   POST /applications/process → document check
    schemas/              Pydantic models of the funding form (company, intervention, evidence, gaps, impact)
    storage/uploads.py    save uploads to temp files
    vision/licence_check.py  OCR keyword check (EasyOCR, lazy)
    speech/asr.py, tts.py    Whisper and Kokoro (lazy)
    legacy/interview/     deprecated voice interview (Ollama); removed in PR D
  tests/                  API smoke tests; fixtures/images (licence/workshop photos)
web/
  src/app/                Next.js routes: landing, /apply/*, /review/*
  src/components/         landing, apply, review, pack, site, ui
  src/lib/                TS rules engine (grid, evaluate, contradictions, gaps), fixtures, i18n, api, store
docs/                     this documentation
```

## Target (after C6)

See [SAD §4](../architecture/SAD.md#4-components-c4-level-3-package-bizzagent) for the package
list:

- `tenancy`, `billing`, `calc`, `rules`, `knowledge`, `i18n`, `llm`, `search`, `opportunities`
- `exports`, `agents/{concierge, skills/*, core/*, common/*}`
- `jobs`, `connector`, `routes/v1`

In the web app, `src/api/{contract, mock, http}` replaces `src/lib/api.ts`, and screens move to
`/w/[ws]/…`, `/me/…` and `/p/[org]/…` ([ux-spec](../design/ux-spec.md)).

## Where to start reading

1. `backend/src/bizzagent/main.py` → `routes/applications.py` → `vision/licence_check.py`
2. `web/src/lib/evaluate.ts` (the rules being ported to Python in C1)
3. [agents.md](../architecture/agents.md) for what the graphs will look like
