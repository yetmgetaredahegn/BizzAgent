# Backend Handoff

> **Status:** Phase 1 (Structural Cleanup) & Phase 2 (Accounts Foundation) — **Verified**  
> **Last updated:** 2026-10-20  
> **Author:** Antigravity AI Assistant (for human contributor)  

---

## 1. Current Objective & Milestone

- **Objective:** Complete the structural reorganization and implement the first real backend capability: the Accounts foundation (authentication, authorization, workspace isolation, and user profile management).
- **Milestone:**
  1. Clean structural foundation reviewed, verified, and committed with Conventional Commits.
  2. Accounts module implemented according to `docs/architecture/module-conventions.md` and `docs/engineering/api.md` §2.
  3. All 42 unit, service, API, and boundary tests passing.
  4. Frontend in `web/` verified completely untouched by backend commits.

---

## 2. Verified Git State

- **Branch:** `chore/agent-scaffold` (up to date with `origin/chore/agent-scaffold`)
- **Working Tree:** Clean — `nothing to commit, working tree clean`
- **Frontend:** `web/` has zero diffs across backend commits `92fe860..97778aa`. Confirmed unchanged.

### Commit History (verified)

| Short SHA | Full SHA | Message |
|---|---|---|
| `92fe860` | `92fe860a2bba0d255ba6d1fd8ac2d210421c3d87` | `docs(architecture): document module conventions and dependency boundary rules` |
| `cb25cab` | `cb25cab5730fd09ea7fa1166595af4cfd1f59913` | `refactor(backend): reorganize modular package structure and remove legacy prototype` |
| `4a69b88` | `4a69b882a69941afc58b3b83ec6ca1c9154ba610` | `docs(backend): record canonical handoff for structural cleanup` |
| `aeb675d` | `aeb675d164eb9669b5fc9a823c436eab5413d03e` | `feat(accounts): implement authentication, authorization, and workspace foundation` |
| `97778aa` | `97778aab7174843c1f74676bc1640f2a81565e25` | `docs(backend): update canonical handoff for accounts foundation` |

All five commits exist and have the reported messages. The handoff documentation commit (`97778aa`) was already committed; no additional documentation commit is needed.

---

## 3. Security Findings

### 3.1 BLOCKER — Phone-only login permits impersonation

**Finding:** `POST /v1/accounts/login` authenticates users by phone number alone. Anyone who knows (or guesses) a registered phone number can obtain a valid JWT and full account access.

**Evidence:**
- [`LoginRequest`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/schemas.py#L26-L29): accepts only `phone: str`, no password or OTP field.
- [`service.login_by_phone()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/service.py#L134-L168): looks up the user by phone hash, issues a JWT immediately with no credential verification.
- [`hash_password()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/security.py#L33-L37) and [`verify_password()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/security.py#L40-L52) exist in `security.py` but are **never called** from any service, router, or repository.
- The [`User` model](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/models.py#L20-L43) has **no `password_hash` column**; passwords cannot be stored.
- Phone numbers are **not verified** before account creation or login. No OTP flow exists.

**Classification:** **BLOCKER for production use.** Any party who knows a phone number can impersonate the account holder.

**Recommended correction (smallest architecture-consistent fix):**

The product docs reference "Phone number. OTP later; a token for now" (`docs/product/roles-and-permissions.md` §1), indicating the team has not yet decided between SMS OTP and password-based authentication. The fix requires a **product decision**:

- **Option A (SMS OTP):** Add an `integrations/sms` adapter, issue a short-lived OTP at login, verify it before issuing a JWT. Requires choosing an SMS provider.
- **Option B (Password):** Add a `password_hash` column to `User`, require a password at registration and login, call the existing `hash_password`/`verify_password` utilities. No external dependency.
- **Option C (Keep phone-only for local dev, gate production):** Add a runtime guard (`settings.env != "dev"`) that refuses phone-only login in non-dev environments. Mark login as dev-only in API docs and OpenAPI. Cheapest interim fix.

> [!IMPORTANT]
> This is a product decision. Do not silently introduce an SMS provider or invent an authentication flow. Human approval is required before implementing any option.

### 3.2 RISK — JWT lacks issuer and audience validation

**Finding:** [`create_access_token()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/security.py#L55-L75) sets `sub`, `iat`, `exp` but no `iss` or `aud` claims. [`decode_access_token()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/security.py#L78-L87) does not validate issuer or audience.

**Impact:** In a single-service deployment this is low risk. If additional services share the JWT secret, tokens from one service could be accepted by another. Standard JWT best practice recommends `iss`/`aud` claims.

**Classification:** **Risk (not a blocker).** Accept for the current single-service scope. Add `iss` and `aud` claims before deploying to a multi-service environment.

### 3.3 RISK — Hard-coded dev-only JWT secret

**Finding:** [`config.py`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/config.py#L17) defaults `jwt_secret` to `"dev-insecure-jwt-secret-do-not-use-in-production"`.

**Impact:** If deployed without setting `BIZZAGENT_JWT_SECRET`, all tokens are signed with a publicly known secret.

**Classification:** **Risk.** The default value is clearly named as dev-only. A production deployment checklist should require setting this environment variable. Consider adding a startup check that refuses to start with the default secret when `env != "dev"`.

### 3.4 Acceptable — Token expiry and signature validation

**Verified working:**
- [`decode_access_token()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/security.py#L83-L87) validates signature and expiry via `jwt.decode()` with explicit `algorithms=[settings.jwt_algorithm]`.
- Expired tokens correctly raise `jwt.ExpiredSignatureError` — [test](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/test_auth.py#L57-L63).
- Tampered tokens correctly raise `jwt.PyJWTError` — [test](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/test_auth.py#L66-L71).

### 3.5 Acceptable — No sensitive data in responses or logs

- `UserResponse` returns `id`, `phone_hash`, `language`, `name`, `created_at` — **not** the raw `phone_number`.
- No `logging`, `print`, or debug output in the accounts module.
- Error messages from [`UnauthorizedException`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/errors.py#L38-L49) include PyJWT exception text (e.g., "Signature verification failed") which is acceptable diagnostic information.

---

## 4. Authorization & Tenancy Findings

### 4.1 Anonymous rejection — ✅ Verified

[`get_current_user()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/dependencies.py#L18-L41) rejects requests missing the `Authorization` header or with an invalid/expired Bearer token, raising `UnauthorizedException` (HTTP 401). Tested at [`test_anonymous_access_to_me_rejected`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/test_auth.py#L160-L162) and [`test_invalid_bearer_token_rejected`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/test_auth.py#L165-L168).

### 4.2 Identity from server-side credentials — ✅ Verified

User identity is derived exclusively from the JWT `sub` claim validated against the database in [`get_current_user()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/dependencies.py#L32-L39). No client-supplied identity fields are trusted.

### 4.3 Workspace isolation (NFR-TEN-001) — ✅ Verified

[`get_current_workspace_membership()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/dependencies.py#L44-L57) checks membership before any workspace-scoped operation. Non-members receive HTTP 404 (not 403), preventing workspace existence leakage. Tested at [`test_workspace_isolation_blocks_cross_workspace_access`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/test_isolation.py#L9-L52).

### 4.4 Capability enforcement — ✅ Verified (pure rules)

[`require_capability()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/dependencies.py#L60-L76) is a dependency factory that checks the capability matrix. [`require_signatory()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/dependencies.py#L79-L85) enforces signatory status. The capability matrix in [`rules.py`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/modules/accounts/rules.py) is thoroughly tested (15 roles × 13 permissions) with all parametrized tests passing.

**Note:** `require_capability()` and `require_signatory()` are correctly exported from the accounts module `__init__.py` but are not yet used on any endpoint since no capability-gated endpoints exist beyond the accounts foundation. They will be exercised when product endpoints (billing, artifacts, etc.) are implemented.

### 4.5 Test coverage — API integration tests use actual HTTP requests

All integration tests use `TestClient` making actual HTTP requests through the full FastAPI stack, not just calling service methods directly. The test fixtures in [`conftest.py`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/conftest.py) correctly override the database dependency with a transactional session that rolls back after each test.

---

## 5. Persistence & Migration Findings

### 5.1 Current state: development-only `init_db()`

[`database.py init_db()`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/src/bizzagent/core/database.py#L57-L63) uses `Base.metadata.create_all()` with `CREATE SCHEMA IF NOT EXISTS`. This is suitable for development and testing but is **not a production migration strategy**:
- No versioned migration history
- No ability to roll back or apply incremental schema changes
- No column alterations or data migrations

### 5.2 Test database setup

Tests use an in-memory SQLite engine with `ATTACH DATABASE` to emulate PostgreSQL's multi-schema architecture (`accounts`, `personal`). This is a reasonable approach for fast unit testing. The [`conftest.py`](file:///c:/Users/yetmgeta/Desktop/Projects/BizzAgent/backend/tests/modules/accounts/conftest.py) uses transactional rollback per test, ensuring test isolation.

### 5.3 Alembic status

**No Alembic configuration exists.** The dependency is not in `pyproject.toml` and no `alembic/` directory exists. The handoff §7.2 correctly identifies this as future work.

**Recommendation:** Establishing an Alembic baseline is appropriate to do alongside the next module that adds tables, not retroactively for the current schema. The current `init_db()` approach is acceptable for this development milestone.

---

## 6. Checks Actually Executed and Their Results

All executed from `backend/` on 2026-10-20:

| Check Command | Result | Details |
|---|---|---|
| `uv run ruff check .` | **Passed** | All checks passed |
| `uv run ruff format --check .` | **Passed** | 44 files already formatted |
| `uv run mypy src` | **Passed** | Success: no issues found in 37 source files |
| `uv run lint-imports` | **Passed** | 24 contracts kept, 0 broken |
| `uv run pytest -v` | **Passed** | 42 passed in 6.16s, 1 warning (httpx deprecation) |

### Test Breakdown (42 tests)

| File | Count | Coverage Area |
|---|---|---|
| `test_auth.py` | 14 | Phone normalization, password hashing (unit), JWT lifecycle (unit), registration, duplicate rejection, login, anonymous/invalid token rejection, profile CRUD |
| `test_isolation.py` | 3 | Cross-workspace access denial (404), member listing scope, capabilities endpoint isolation |
| `test_permissions.py` | 10 + 15 parametrized | Workspace types, legal forms, partner kinds, owner capabilities, signatory requirement, role-specific restrictions, all 15 roles evaluated |
| `test_structure.py` | 2 | No heavy imports, package layers exist |

### Coverage assessment

**Well covered:**
- Registration and duplicate identities ✅
- Phone normalization across formats ✅
- Token creation, validation, and expiry ✅
- Tampered token rejection ✅
- Workspace isolation (NFR-TEN-001) ✅
- Capability matrix (all 15 roles × 13 permissions) ✅
- Signatory enforcement in pure rules ✅
- Profile read and update ✅
- Input validation (invalid workspace path) ✅

**Not covered (acceptable for current scope):**
- Expired token used against a real endpoint (tested at the crypto layer, not HTTP)
- `require_capability()` and `require_signatory()` exercised via HTTP (no capability-gated endpoints yet)
- Concurrent registration race conditions (acceptable for SQLite test backend)
- Password hashing utilities are tested but unused in any flow

---

## 7. Frontend Contract Compatibility

**Frontend state:** `web/` is completely untouched by backend commits (`git diff 92fe860~1..97778aa -- web/` is empty).

### Alignment with `web/src/api/contract.ts`

| Backend Type | Frontend Type | Match |
|---|---|---|
| `CreateAccountRequest` fields (`phone`, `language`, `path`, `legalForm`, `partnerKind`, `name`, `profile`) | `CreateAccountInput` (L101-L110) | ✅ Field-compatible |
| `VALID_WORKSPACE_TYPES` (`explorer`, `team`, `business`, `collective`, `partner`) | `WorkspaceType` (L36) | ✅ Exact match |
| `VALID_LEGAL_FORMS` (12 values) | `LegalForm` (L38-L50) | ✅ Exact match |
| `VALID_PARTNER_KINDS` (`funder`, `program`, `support_org`) | `PartnerKind` (L52) | ✅ Exact match |
| `ALL_ROLES` (15 roles) | `Role` (L54-L69) | ✅ Exact match |
| `WorkspaceSummary` fields (`id`, `name`, `type`, `legalForm`, `partnerKind`, `role`, `signatory`, `stage`) | `WorkspaceSummary` (L71-L81) | ✅ Field-compatible |

### Noted differences (acceptable)

- Backend `AuthResponse` returns `{ user, token, workspace }`. Frontend `createAccount()` returns `Promise<Me>` — the mock client reshapes the response. The HTTP client (future `web/src/api/http/client.ts`, currently an empty stub) will need to perform this mapping.
- Frontend `Me` includes `credits: number` (L98) which the backend does not yet provide. This will need to come from a `billing` module.

---

## 8. Module File Structure (Verified)

Adheres to `docs/architecture/module-conventions.md`:

| File | Purpose | Verified |
|---|---|---|
| `core/database.py` | Engine, session factory, `get_db`, multi-schema init | ✅ |
| `core/security.py` | Phone normalization, SHA-256 hashing, PBKDF2 password hashing, JWT encode/decode | ✅ |
| `core/errors.py` | Standard API error response handler and domain exceptions | ✅ |
| `modules/accounts/rules.py` | Pure capability matrix, role sets, legal form validations | ✅ |
| `modules/accounts/models.py` | SQLAlchemy entities (`User`, `Organization`, `Membership`, `PersonalSpace`) | ✅ |
| `modules/accounts/schemas.py` | Pydantic contracts with snake_case/camelCase aliases | ✅ |
| `modules/accounts/repository.py` | Org-scoped database queries | ✅ |
| `modules/accounts/service.py` | Business use-case orchestration | ✅ |
| `modules/accounts/dependencies.py` | `get_current_user`, `get_current_workspace_membership`, `require_capability`, `require_signatory` | ✅ |
| `modules/accounts/router.py` | Thin HTTP handlers mounted at `/v1` and root | ✅ |
| `modules/accounts/__init__.py` | Public module API | ✅ |

---

## 9. Implemented API Contracts

Base path: `/v1` (also accessible at `/`):

| Method | Path | Auth | Response | Description |
|---|---|---|---|---|
| `POST` | `/v1/accounts` | Public | `AuthResponse` | Registration: user + personal space + org + owner membership |
| `POST` | `/v1/accounts/login` | Public | `AuthResponse` | **⚠️ Phone-only (see §3.1)** |
| `GET` | `/v1/me` | Bearer | `MeResponse` | Profile + workspace summary |
| `PATCH` | `/v1/me` | Bearer | `UserResponse` | Update language/name |
| `GET` | `/v1/me/capabilities` | Bearer + `?ws=` | `CapabilitiesResponse` | Capabilities in workspace |
| `GET` | `/v1/workspaces/{ws}` | Bearer | `WorkspaceResponse` | Workspace details (404 if not member) |
| `GET` | `/v1/workspaces/{ws}/members` | Bearer | `list[MemberResponse]` | Member directory (404 if not member) |

---

## 10. Required Corrective Actions

### Before next module (must-do)

1. **[BLOCKER] Resolve authentication strategy** — Human decision required (see §3.1, Options A/B/C). Phone-only login must not remain the production authentication mechanism.

### Before production deployment (should-do)

2. **Add `iss`/`aud` JWT claims** — Add `iss: "bizzagent"` and `aud: "bizzagent-api"` to token creation and validation.
3. **Add startup guard for JWT secret** — Refuse to start with the default dev secret when `env != "dev"`.
4. **Establish Alembic migration baseline** — Add Alembic to dependencies, generate an initial migration from the current models.

### Recommended alongside next module (nice-to-have)

5. Add an HTTP-level test for expired token rejection (currently only tested at the crypto layer).
6. Exercise `require_capability()` via HTTP when the first capability-gated endpoint is added.

---

## 11. Milestone Assessment

**The Accounts milestone is NOT production-ready** due to the phone-only authentication blocker (§3.1). However, the structural foundation, authorization model, workspace isolation, capability matrix, and test coverage are solid and well-implemented.

**The milestone IS suitable for:**
- Development and demonstration
- Building the next module on top of the accounts foundation
- Frontend integration development (using the mock client)

**Do not proceed to production deployment** until the authentication blocker is resolved with an approved solution.

---

## 12. Next Steps

1. **Human decision:** Choose authentication strategy (§3.1 Options A/B/C).
2. **Implement the chosen authentication** as a targeted correction within the accounts module.
3. **Then:** Proceed to the next platform milestone per the roadmap (e.g., `calc` pure calculators or `billing` double-entry ledger).
