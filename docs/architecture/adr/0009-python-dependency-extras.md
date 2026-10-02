# ADR-0009: Python dependency extras

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Torch, Whisper, Kokoro and EasyOCR are heavy and not needed by most developers or CI.

## Decision

The core install is light. Heavy stacks are optional extras (`speech`, `vision`, `exports`, `search`, `llm-hosted`, `llm-local`), imported lazily. A test asserts that importing the API loads none of them.

## Consequences

Fast CI and onboarding. Code must keep heavy imports inside functions.
