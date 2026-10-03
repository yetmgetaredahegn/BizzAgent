# ADR-0016: Channel adapters

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Many users live on Telegram, WhatsApp or feature phones.

## Decision

Channels implement a `ChannelAdapter` (receive, send text and audio, identity mapping) that feeds the same concierge graph. Web now; Telegram, WhatsApp and IVR/USSD later.

## Consequences

New channels need no agent changes. Each adds audio-format and identity concerns.
