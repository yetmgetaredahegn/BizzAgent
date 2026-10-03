# ADR-0033: Missions as durable multi-skill LangGraph threads

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Goals like "get funded" span weeks and many skills.

## Decision

A mission is a thread: a planner DAG validated deterministically, an executor with `Send`, checkpoints, interrupts for approvals and external waits, resumption by jobs or events, and forks via time travel.

## Consequences

Long-running work survives restarts. Thread storage grows, so retention policies are needed.
