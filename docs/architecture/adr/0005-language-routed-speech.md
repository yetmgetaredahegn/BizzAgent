# ADR-0005: Language-routed speech stack

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

ASR/TTS quality varies by language; Afaan Oromo support is weak in many engines.

## Decision

Speech goes through `speech.asr`/`speech.tts` protocols, selected per language from config: hosted APIs in production where verified for am/om, local Whisper/Kokoro/MMS in development, fakes in CI. Text input is always available.

## Consequences

Providers can be swapped per language after measured word-error-rate spikes. More adapters to maintain.
