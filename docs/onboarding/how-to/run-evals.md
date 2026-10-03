# How to run evals

> **What this is:** running the model evaluation suite (PR C2 onward). Not part of CI.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. Configure the model set in `backend/.env`: hosted keys for the production set, or Ollama
   models for development.
2. Run `cd backend && make eval` (all skills) or `make eval SKILL=numbers LANG=om`.
3. Read `backend/evals/results/<date>.json`. **Fabricated facts must be 0.** See
   [testing §4](../../engineering/testing-and-evaluation.md#4-evals-make-eval).
4. Add golden cases under `backend/evals/golden/<skill>/` whenever you fix a model-behaviour
   bug.
