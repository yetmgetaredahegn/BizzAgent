# Backend Handoff

> **Status:** Phase 1 (Structural Cleanup Commits) & Phase 2 (Accounts Capability Foundation) Complete  
> **Last updated:** 2026-10-17  
> **Author:** Antigravity AI Assistant (for human contributor)  

---

## 1. Current Objective & Milestone

- **Objective:** Complete the structural reorganization and implement the first real backend capability: the Accounts foundation (authentication, authorization, workspace isolation, and user profile management).
- **Milestone:** 
  1. Clean structural foundation reviewed, verified, and committed with Conventional Commits.
  2. Accounts module implemented according to `docs/architecture/module-conventions.md` and `docs/engineering/api.md` §2.
  3. All 42 unit, service, API, and boundary tests passing.
  4. Frontend in `web/` verified completely untouched.

---

## 2. Structural Cleanup Commits (Phase 1)

The following Conventional Commits were executed on branch `chore/agent-scaffold`:

1. `92fe860`: `docs(architecture): document module conventions and dependency boundary rules`
   - Added `docs/architecture/module-conventions.md` (authoritative module file structure).
   - Added `docs/architecture/dependency-rules.md` (layer hierarchy and boundary enforcement).
   - Updated `AGENTS.md` with persistent instructions for future assistant sessions.
2. `cb25cab`: `refactor(backend): reorganize modular package structure and remove legacy prototype`
   - Removed legacy prototype code (`bizzagent/legacy/`, `routes/`, `schemas/`, `speech/`, `vision/`, `storage/`).
   - Relocated configuration to `bizzagent/core/config.py`.
   - Cleaned up application entry in `bizzagent/main.py`.
   - Established `core/`, `shared/`, `integrations/`, and 20 `modules/` packages.
   - Synchronized dependencies and `uv.lock`.
   - Added structural boundary smoke tests in `tests/test_structure.py`.
3. `4a69b88`: `docs(backend): record canonical handoff for structural cleanup`
   - Added initial canonical handoff documenting the structural baseline.

---

## 3. Accounts Implementation (Phase 2)

### 3.1 Functionality Implemented
- **User Identity & Lifecycle:** Phone-first identity registration (`POST /v1/accounts`), storing normalized phone numbers and privacy-preserving SHA-256 phone hashes.
- **Authentication:** Token-based authentication (`POST /v1/accounts/login`) returning signed JWT tokens with 7-day expiration and signature validation (`HS256`).
- **Authorization & Capability Matrix:** Deterministic pure rule capability evaluator (`rules.py`) implementing the 15 roles and 13 permissions from `docs/product/roles-and-permissions.md` §4, including the `authorised_signatory` requirement for `submit_and_sign`.
- **Tenancy & Workspace Scoping:** Per-workspace membership checking ensuring `NFR-TEN-001` (requests outside a caller's memberships return HTTP 404, never leaking workspace existence).
- **Profile & Capabilities Management:** `GET /v1/me`, `PATCH /v1/me`, `GET /v1/me/capabilities?ws={ws}`, and `GET /v1/workspaces/{ws}/members`.

### 3.2 Module File Structure
Adheres to `docs/architecture/module-conventions.md`:
- `backend/src/bizzagent/core/database.py`: SQLAlchemy engine, session factory, `get_db` dependency, and multi-schema initialization.
- `backend/src/bizzagent/core/security.py`: Phone normalization (`+251...`), SHA-256 phone hashing, PBKDF2-HMAC-SHA256 password hashing/verification, and JWT access token encode/decode.
- `backend/src/bizzagent/core/errors.py`: Standard API error response handler and domain exception types (`UnauthorizedException`, `ForbiddenActionException`, `NotFoundException`, `ConflictException`).
- `backend/src/bizzagent/modules/accounts/rules.py`: Pure domain logic containing the capability matrix, role sets, legal form validations, and signatory checks.
- `backend/src/bizzagent/modules/accounts/models.py`: SQLAlchemy entities in `accounts` schema (`User`, `Organization`, `Membership`) and `personal` schema (`PersonalSpace`).
- `backend/src/bizzagent/modules/accounts/schemas.py`: Validated Pydantic contracts supporting both snake_case and camelCase aliases for the frontend JSON contract.
- `backend/src/bizzagent/modules/accounts/repository.py`: Org-scoped database queries.
- `backend/src/bizzagent/modules/accounts/service.py`: Business use-case orchestration.
- `backend/src/bizzagent/modules/accounts/dependencies.py`: Request-scoped FastAPI dependencies (`get_current_user`, `get_current_workspace_membership`, `require_capability`, `require_signatory`).
- `backend/src/bizzagent/modules/accounts/router.py`: Thin HTTP handlers mounted at `/v1` and root.
- `backend/src/bizzagent/modules/accounts/__init__.py`: Public module API exposing service, schemas, rules, dependencies, and `accounts_router`.

---

## 4. Implemented API Contracts

Base path: `/v1` (also accessible at `/`):

| Method | Path | Request Body | Response Body | Description |
|---|---|---|---|---|
| `POST` | `/v1/accounts` | `CreateAccountRequest` | `AuthResponse` (`user`, `token`, `workspace`) | Public registration creating user, personal space, org, and owner membership |
| `POST` | `/v1/accounts/login` | `LoginRequest` (`phone`) | `AuthResponse` (`user`, `token`, `workspace`) | Public sign-in via registered phone number |
| `GET` | `/v1/me` | None (`Bearer <token>`) | `MeResponse` (`user`, `language`, `workspaces`, `personal_space_id`) | Authenticated profile and workspace summary |
| `PATCH` | `/v1/me` | `UpdateMeRequest` (`language?`, `name?`) | `UserResponse` | Update language and name |
| `GET` | `/v1/me/capabilities` | Query `?ws={id}` (`Bearer <token>`) | `CapabilitiesResponse` (`capabilities: string[]`) | List caller's capabilities in specified workspace |
| `GET` | `/v1/workspaces/{ws}` | None (`Bearer <token>`) | `WorkspaceResponse` | Workspace metadata (returns 404 if not a member) |
| `GET` | `/v1/workspaces/{ws}/members` | None (`Bearer <token>`) | `list[MemberResponse]` | Workspace member directory (returns 404 if not a member) |

---

## 5. Checks Actually Executed and Their Results

All executed from `backend/`:

| Check Command | Result | Notes |
|---|---|---|
| `uv lock --check` | **Passed** | 49 packages resolved in 1ms |
| `uv run ruff check .` | **Passed** | All checks clean |
| `uv run ruff format --check .` | **Passed** | 44 files checked, 44 already formatted |
| `uv run mypy src` | **Passed** | Success: no issues found in 37 source files |
| `uv run lint-imports` | **Passed** | 24 contracts kept, 0 broken |
| `uv run pytest` | **Passed** | 42 passed in 2.95s (all permission, auth, isolation, and structure tests pass) |

---

## 6. Frontend Contract Compatibility & Alignment

- **Frontend State:** `web/` is **completely untouched** (`git status web` clean).
- **Match:** `CreateAccountRequest` accepts `phone`, `language`, `path`, `legalForm`, `partnerKind`, `name`, and `profile` facts, matching `CreateAccountInput` in `web/src/api/contract.ts`.
- **Match:** Response from `POST /v1/accounts` returns `{ user, token, workspace }` per `docs/engineering/api.md` §2.
- **Match:** Workspace summary shapes match `WorkspaceSummary` in `web/src/api/contract.ts` (`id`, `name`, `type`, `legalForm`, `role`, `signatory`, `stage`).
- **Upcoming Frontend Integration Note:** The frontend prototype currently routes calls through `web/src/api/mock/client.ts`. When PR D introduces the HTTP client (`web/src/api/http/`), it will point to these backend endpoints without needing any backend contract changes.

---

## 7. Outstanding Limitations & Future Work

1. **SMS / OTP Gateway:** The prototype uses direct phone verification tokens ("Phone number. OTP later; a token for now" per `docs/product/roles-and-permissions.md` §1). Live SMS OTP provider integration will be placed under `integrations/sms` when ready.
2. **PostgreSQL Migrations:** Schema creation currently uses SQLAlchemy `init_db`. Alembic migration scripts for production database evolution can be added when deploying to managed PostgreSQL.
3. **Invitations & Consent Grants:** Invitation sending and `ConsentGrant` records for external advisors will be added alongside the Team screens.

---

## 8. Git State & Phase 2 Commit

- **Branch:** `chore/agent-scaffold`
- **Phase 2 Commit:** `aeb675d` — `feat(accounts): implement authentication, authorization, and workspace foundation`
- **Working Tree:** Clean (apart from this handoff update).
- **Frontend Status:** Unchanged and verified clean throughout all phases.

---

## 9. Exact Next Steps

1. Commit this handoff update: `docs(backend): update canonical handoff for accounts foundation`.
2. Proceed to next platform milestone in roadmap (e.g. `billing` double-entry ledger or `calc` pure calculators per roadmap C1).
