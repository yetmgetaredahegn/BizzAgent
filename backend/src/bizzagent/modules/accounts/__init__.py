"""Accounts module — users, workspaces, members, roles, capability matrix, and auth tokens.

Platform module. Schema: ``accounts``.

Exports public API contracts and router for application composition.
Never exports internal ORM models or repository implementations directly.
"""

from bizzagent.modules.accounts.dependencies import (
    get_current_user,
    get_current_workspace_membership,
    require_capability,
    require_signatory,
)
from bizzagent.modules.accounts.router import router
from bizzagent.modules.accounts.rules import get_capabilities_for_role, has_capability
from bizzagent.modules.accounts.schemas import (
    AuthResponse,
    CapabilitiesResponse,
    CreateAccountRequest,
    LoginRequest,
    MemberResponse,
    MeResponse,
    UpdateMeRequest,
    UserResponse,
    WorkspaceResponse,
    WorkspaceSummary,
)
from bizzagent.modules.accounts.service import AccountsService

accounts_router = router

__all__ = [
    "AccountsService",
    "AuthResponse",
    "CapabilitiesResponse",
    "CreateAccountRequest",
    "LoginRequest",
    "MeResponse",
    "MemberResponse",
    "UpdateMeRequest",
    "UserResponse",
    "WorkspaceResponse",
    "WorkspaceSummary",
    "accounts_router",
    "get_capabilities_for_role",
    "get_current_user",
    "get_current_workspace_membership",
    "has_capability",
    "require_capability",
    "require_signatory",
    "router",
]
