# Architecture decision records

> **What this is:** the index of ADRs (Nygard format). Copy [template.md](template.md) for a new one; never edit an accepted ADR's decision. Supersede it instead.
> **Who reads it:** engineers and reviewers.
> **Last reviewed:** 2026-10-02

| ADR | Decision |
|---|---|
| [0001](0001-supervisor-and-skill-subgraphs.md) | LangGraph supervisor (concierge) with skill sub-graphs |
| [0002](0002-deterministic-rules-in-python.md) | Deterministic calculators and rules in Python |
| [0003](0003-nextjs-replaces-streamlit.md) | Next.js web client replaces Streamlit |
| [0004](0004-sqlite-now-postgres-later.md) | SQLite with the LangGraph SQLite checkpointer and store now, PostgreSQL later |
| [0005](0005-language-routed-speech.md) | Language-routed speech stack |
| [0006](0006-pluggable-llm-per-role.md) | Pluggable LLM per role: hosted in production, Ollama in development, fake in CI |
| [0007](0007-provenance-model.md) | Provenance model across all artifacts |
| [0008](0008-self-hosted-fastapi.md) | Self-hosted FastAPI, not LangGraph Platform |
| [0009](0009-python-dependency-extras.md) | Python dependency extras |
| [0010](0010-organisations-and-tenancy.md) | Organisations and tenancy (shared schema, org_id) |
| [0011](0011-call-configuration-as-data.md) | Funder call configuration as versioned data |
| [0012](0012-document-exports.md) | Document exports with docxtpl, HTML → PDF and openpyxl |
| [0013](0013-memory-in-langgraph-store.md) | Profile and business memory in the LangGraph Store |
| [0014](0014-country-knowledge-packs.md) | Country knowledge packs with citations and verification |
| [0015](0015-pluggable-search-provider.md) | Pluggable web-search provider |
| [0016](0016-channel-adapters.md) | Channel adapters |
| [0017](0017-rename-to-bizzagent.md) | Rename FundFlow to BizzAgent and drop the single-funder branding |
| [0018](0018-legal-and-financial-safety.md) | Safety boundaries for legal and financial guidance |
| [0019](0019-opportunity-catalogue.md) | Opportunity catalogue: sources, freshness, verification and scam policy |
| [0020](0020-background-jobs.md) | Background jobs via a CLI, cron-friendly |
| [0021](0021-accounts-and-roles.md) | Accounts, workspace types and role-based capabilities |
| [0022](0022-personal-space-privacy.md) | Personal space privacy and personal/business separation |
| [0023](0023-fair-hiring.md) | Fair hiring: rubric-based, job-related screening |
| [0024](0024-credit-wallet.md) | Pay-as-you-go credit wallet with a double-entry ledger and payment adapters |
| [0025](0025-learning-memory-and-import.md) | Learning memory with user confirmation, and AI-history import |
| [0026](0026-document-explainer.md) | Document explainer: grounding, red-flag rules, legal-safety boundary |
| [0027](0027-frontend-first-prototype.md) | Frontend-first prototype on a typed mock client |
| [0028](0028-moat-test-and-connector.md) | Moat test as a product rule; MCP connector strategy |
| [0029](0029-tamper-evident-documents.md) | Tamper-evident documents: content hash and verification page |
| [0030](0030-peer-benchmarks.md) | Peer benchmarks with opt-in and k-anonymity ≥ 10 |
| [0031](0031-business-passport.md) | Business Passport and consented sharing |
| [0032](0032-autonomy-and-inbox.md) | Autonomy levels L0–L3 and the approvals inbox |
| [0033](0033-missions-as-durable-threads.md) | Missions as durable multi-skill LangGraph threads |
| [0034](0034-verifier-chain.md) | Verifier chain before user-visible output |
