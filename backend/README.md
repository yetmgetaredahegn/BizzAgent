# BizzAgent backend

FastAPI service for BizzAgent. See the repository README for setup.

```bash
uv sync --group dev
uv run uvicorn bizzagent.main:app --reload
```

Heavy local models are optional extras: `uv sync --extra speech --extra vision --extra llm-local`.
