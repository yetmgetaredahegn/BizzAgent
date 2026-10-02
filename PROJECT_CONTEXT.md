# FundFlow — AI Builder Hackathon Project Context

## Project Identity

Project name: **FundFlow**

FundFlow is an AI-powered funding application assistant being built for the **Hackation AI Builder Hackathon in Addis Ababa, August 29–30, 2026**.

The project is being built as a hackathon MVP and must prioritize a working end-to-end demonstration over unnecessary architectural complexity.

The repository already exists on GitHub under the name **FundFlow**.

---

# Hackathon Challenge

## Challenge 1: From a Voice Note to a Fundable Proposal

Build an agent that turns a spoken story, phone photos, and a paper licence into a complete, honest funding application.

### Challenge Owner

Zenawi Haile.

### The Problem

Money for small Ethiopian businesses exists, but the application process is difficult for many of the people the funding is intended to support.

The application may require:

* Five years of sales history
* Employment numbers split by gender and age
* A management table
* An organogram
* A machinery list
* Multiple declarations
* Sector information
* Beneficiary information
* Project milestones

Applications are scored using a weighted 100-point grid with multiple criteria and exclusion factors.

Applicants may have limited digital literacy, feature phones, paper licences, incomplete records, or difficulty understanding formal funding terminology.

The system must therefore help applicants transform the information they can actually provide into structured application data.

A critical principle is:

> **Never invent or guess information. Every unverified field must remain flagged as unverified or missing.**

---

# Chosen Product Path

The project is focusing primarily on the **Applicant Path**.

The Applicant Path is:

> An intake agent between someone who talks and a system that takes structured records.

The system should help an applicant provide information through natural interaction rather than requiring them to manually complete a complex application form.

The applicant may provide:

1. A voice recording in Amharic, Oromo, or English.
2. A photo of a business licence.
3. A photo of the workshop or business.
4. Follow-up answers when important information is missing.

The system should then:

* Transcribe and analyze the spoken information.
* Extract information from uploaded documents and photos.
* Convert evidence into structured application fields.
* Detect missing information.
* Ask targeted follow-up questions.
* Clearly distinguish established information from unverified information.
* Generate a structured funding application draft.
* Generate an ImpactProtocol project draft.
* Run eligibility and scoring logic where applicable.
* Produce a clear gap list.

The Reviewer Path is not the primary MVP unless time permits.

---

# Minimum Required Demo

The minimum demo should support the following workflow.

## Input

Accept:

* Speech in Amharic, Oromo, or English.
* A licence photo.
* A workshop/business photo.

## Structured Application

Fill the required application form schema, especially sections 1.1 through 2.6.

Generate an ImpactProtocol draft containing:

* Title
* Location
* Relevant SDGs
* ETB funding target
* Beneficiaries
* Milestones
* Sector

## Evaluation

Run:

* Eligibility checks
* Exclusion factor checks
* Appropriate scoring/grid logic

The output should include reasoning and explicitly name exclusions where applicable.

## Gap Detection

For every field that cannot be established, produce:

* The missing field
* Why it is missing or unverified
* What evidence or information is needed
* Who should provide it

The system must never silently guess missing values.

## Declarations

Explain at least three declarations in the applicant's language.

Record that the applicant understood the declaration.

The system must **never automatically tick or falsely confirm a declaration**.

---

# Target Users

The challenge provides fictional example users such as:

## Almaz Wolde

* 54 years old
* Runs a spice mill in Bekoji Tera
* Eight employees
* Six employees are women
* Packs berbere for shops in two towns
* Has a paper licence
* Uses a feature phone
* Her son forwards WhatsApp voice notes
* Speaks Oromo and Amharic
* Has never seen an organogram

## Nahom Tadesse

* 28 years old
* Electronics repair shop in Addis Ababa
* Three staff
* Android phone
* Decent English
* Wants a second rework station for board-level repairs
* Can complete forms but may guess financial information
* May not understand how scoring grid variants affect his application

## Hiwot Alemu

* 26 years old
* Runs a training and job-placement initiative
* Trains young people for free
* Earns revenue when graduates are placed
* Wants to submit a project on ImpactProtocol
* May not understand SDGs, milestones, or sector classification

---

# Core Product Principle

The most important design principle is:

## Evidence over hallucination.

Every extracted field should conceptually have a status such as:

* `established`
* `unverified`
* `missing`
* `contradictory`

The system must preserve the distinction between:

1. What the applicant actually said.
2. What was extracted from a document.
3. What was observed from an image.
4. What was inferred but not verified.

Do not convert uncertain AI inference into factual application data.

If the AI believes something is likely but cannot establish it, the system should ask the applicant or flag the field.

---

# Technical Architecture

The selected architecture is:

```text
Streamlit Frontend
        |
        | HTTP
        v
FastAPI Backend
        |
        +-----------------------------+
        |                             |
        v                             v
LangGraph Agent Workflow       Deterministic Rules
        |                             |
        v                             v
LLM / AI Services              Eligibility / Scoring
        |
        +-------------+
        |             |
        v             v
Speech Processing   Image/Document Processing
        |
        v
Structured Evidence
        |
        v
SQLite Persistence
```

## Frontend

**Decision update (post-hackathon, for the sequa presentation):** the product
frontend is a **Next.js 16** app in `web/` (App Router, TypeScript, Tailwind v4).
It replaces Streamlit as the user-facing interface. The Streamlit app in
`frontend/` stays as a developer harness for the voice interview.

`web/` is responsible for:

* The landing page
* Applicant path: intake (licence and workshop photos), voice interview
  (recording or WhatsApp voice-note upload), application pack for sections
  1.1–2.6 with a status per field, gap list, three declarations explained in
  Amharic, Afaan Oromo and English (understanding recorded, never ticked),
  provisional score, ImpactProtocol draft, submit
* Reviewer path: ranked shortlist of a 12-application batch, per-company
  justification, contradictions, site-visit questions, JSON import and CSV export

Where the backend has no endpoint yet (eligibility, scoring, declarations,
reviewer ranking), `web/src/lib` holds deterministic TypeScript rules and typed
demo fixtures shaped like the Pydantic schemas. The scoring grid in
`web/src/lib/grid.ts` is illustrative until sequa's official grid is available,
and the rules in `web/src/lib/evaluate.ts` should move to `backend/app/rules.py`.

The frontend should communicate with the backend through FastAPI.

---

# Backend

Use **FastAPI** as the primary backend.

FastAPI is responsible for:

* API endpoints
* File upload handling
* Application sessions
* AI orchestration
* LangGraph execution
* State management
* Evidence processing
* Validation
* Gap detection
* Eligibility logic
* Scoring logic
* Persistence

The agent logic should not be tightly coupled to the Streamlit UI.

---

# AI and Agent Stack

The project currently uses and has experience with:

* Python
* LangChain
* LangGraph
* Ollama

The development environment already successfully tested:

* `llama3.1:8b`
* Tool calling with `llama3.1:8b`
* `langchain-ollama`

Installed Ollama models include:

* `llama3.1:8b`
* `qwen2.5:7b-instruct`
* `qwen2.5-coder:7b`
* `qwen2.5-coder:1.5b`
* `nomic-embed-text`

The preferred general-purpose model for agent reasoning is currently:

> **llama3.1:8b through Ollama**

This was chosen over the coding model because the agent performs general reasoning, extraction, interviewing, and structured information processing rather than primarily code generation.

However, model selection should remain practical. If a specific component requires a different model, recommend it based on the task.

---

# Agent Design Philosophy

Do not build one giant prompt that tries to perform the entire application process.

Use a structured workflow.

A conceptual workflow is:

```text
START
  |
  v
Receive Application Inputs
  |
  +--> Voice Processing
  |
  +--> Licence Processing
  |
  +--> Workshop Image Processing
  |
  v
Extract Evidence
  |
  v
Normalize into Structured Fields
  |
  v
Merge Evidence
  |
  v
Detect Contradictions
  |
  v
Check Missing Required Fields
  |
  +---- Missing --> Generate Targeted Follow-up Question
  |                    |
  |                    v
  |                 Receive Answer
  |                    |
  |                    +------> back to Evidence Merge
  |
  v
Generate Application Draft
  |
  v
Run Eligibility / Exclusion Logic
  |
  v
Run Scoring Logic
  |
  v
Generate Gap List
  |
  v
Explain Declarations
  |
  v
END
```

LangGraph should orchestrate the stateful workflow.

Deterministic business rules should remain ordinary Python code wherever possible.

Do not ask the LLM to perform deterministic arithmetic, eligibility checks, or weighted scoring when explicit programmatic rules can perform them.

---

# Important Separation of Responsibilities

## LLM / Agent Responsibilities

Use AI for:

* Extracting information from natural language.
* Understanding applicant narratives.
* Mapping evidence into structured fields.
* Identifying potentially missing information.
* Generating natural follow-up questions.
* Explaining declarations in accessible language.
* Generating readable application draft text.
* Detecting semantic contradictions that require reasoning.

## Deterministic Python Responsibilities

Use normal Python code for:

* Required field validation.
* Eligibility gates.
* Exclusion factors.
* Arithmetic.
* Ownership percentage totals.
* Weighted score calculations.
* Schema validation.
* Known contradiction checks.

Example:

If ownership percentages total 110%, this should be detected programmatically.

If the licence date conflicts with claimed years of operation, the system may use both deterministic checks and AI reasoning to flag the contradiction.

---

# Suggested Data Model

Every application field should preserve provenance.

Conceptually:

```text
ApplicationField
├── value
├── status
├── source
├── evidence
├── confidence
└── notes
```

Example statuses:

* established
* unverified
* missing
* contradictory

Example sources:

* applicant_voice
* applicant_followup
* licence
* workshop_photo
* system_calculation

The LLM must not be treated as an evidence source.

The LLM interprets evidence; it does not create evidence.

---

# API Philosophy

Keep the API small for the hackathon MVP.

Potential endpoints:

## Start application

`POST /applications/start`

Accepts:

* Audio
* Licence image
* Workshop image

Returns:

* Application ID
* Initial extracted information
* Current gaps
* Next question if required

## Submit follow-up answer

`POST /applications/{application_id}/answer`

Accepts:

* Text answer or audio answer

Returns:

* Updated application state
* New gaps
* Next question

## Get application

`GET /applications/{application_id}`

Returns the current application state.

## Evaluate application

`POST /applications/{application_id}/evaluate`

Runs:

* Eligibility checks
* Exclusion checks
* Grid/scoring logic

Returns evaluation results.

Avoid creating unnecessary endpoints.

---

# Development Priorities

The project has very limited hackathon time.

Priority order:

## Priority 1 — End-to-End Happy Path

A user provides:

* Voice note
* Licence image
* Workshop image

The system produces a structured application draft.

## Priority 2 — Honest Gap Detection

Missing information is explicitly flagged.

The system asks at least one or more targeted follow-up questions.

## Priority 3 — Evidence and Verification

Clearly distinguish:

* established
* missing
* unverified
* contradictory

## Priority 4 — Eligibility and Scoring

Implement the actual provided rules as deterministic Python logic.

## Priority 5 — UI Polish

Improve the Streamlit experience only after the workflow works.

---

# Things to Avoid

Do not introduce unnecessary complexity during the hackathon.

Avoid unless specifically needed:

* Next.js
* NestJS
* Microservices
* Redis
* Celery
* Kafka
* Kubernetes
* Multiple databases
* Complex authentication
* Premature Docker complexity
* Excessive abstraction
* Building both Applicant and Reviewer paths before the Applicant path works

The goal is a convincing working MVP.

---

# Development Style

Work incrementally.

Do not generate the entire project blindly.

For each implementation step:

1. Explain the purpose briefly.
2. Identify exactly which files will be created or modified.
3. Implement one coherent vertical slice.
4. Run or test it.
5. Fix errors before expanding the system.
6. Update project context when an important architectural decision changes.

Prefer simple, readable code over clever abstractions.

When debugging, inspect the actual error and current code rather than guessing.

Do not silently rewrite large parts of the architecture without explaining why.

---

# Current Developer Background and Environment

The primary developer is a Software Engineering student with existing experience in:

* Python
* FastAPI
* Django / DRF
* SQL
* Git and GitHub
* Docker
* AI application development
* LangChain
* LlamaIndex
* Ollama

The current laptop is capable of running local models but has limited GPU resources, so local model choices must be practical.

Current relevant environment:

* Windows 11
* Python 3.13
* Git
* GitHub
* Docker Desktop
* Ollama
* Existing LangChain development environment

The developer recently completed the LangChain Academy Foundation: Introduction to LangChain - Python setup and has successfully tested local Ollama integration and tool calling.

---

# How ChatGPT Should Assist

Act as a senior AI engineer and pragmatic hackathon technical partner.

Prioritize:

* Correctness
* Speed of implementation
* Practical architecture
* Debugging
* Honest AI behavior
* Demonstrable end-to-end functionality

Do not overwhelm the developer with many alternative architectures unless there is a meaningful trade-off.

When recommending a technology, explain why it fits this exact project and time constraint.

When implementing code, maintain consistency with the existing repository structure.

Before introducing a major dependency, verify whether it is actually necessary.

The goal is to build a strong, working FundFlow MVP for the hackathon rather than a theoretically perfect production platform.
