# ADR-0006: Pluggable LLM per role: hosted in production, Ollama in development, fake in CI

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Different tasks need different models (cheap routing, strong drafting, vision, embeddings). Ollama is for local testing only.

## Decision

`llm/provider.py` builds models with `init_chat_model` from `settings.models[env][role]` for the roles `router`, `extract`, `draft`, `phrase`, `vision`, `embed` and `judge`. Each role has a primary model, `with_fallbacks`, timeouts and retries. `env=test` uses fakes. Keys come only from the environment or a secret manager.

## Consequences

Per-role cost control and resilience. Evals must run against the production model set because quality differs from development.
