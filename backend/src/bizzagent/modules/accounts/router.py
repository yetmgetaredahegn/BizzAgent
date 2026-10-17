"""FastAPI route definitions for the Accounts module.

Serves /accounts, /me, and /workspaces/{ws} endpoints according to docs/engineering/api.md §2.
Contains no business logic or database queries directly.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from bizzagent.core.database import get_db
from bizzagent.modules.accounts.dependencies import (
    get_current_user,
    get_current_workspace_membership,
)
from bizzagent.modules.accounts.models import Membership, User
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
)
from bizzagent.modules.accounts.service import AccountsService

router = APIRouter(tags=["accounts"])


@router.post(
    "/accounts",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new account, personal space, and primary workspace",
)
def create_account(
    data: CreateAccountRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    service = AccountsService(db)
    return service.register_account(data)


@router.post(
    "/accounts/login",
    response_model=AuthResponse,
    summary="Sign in with a registered phone number",
)
def login_with_phone(
    data: LoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    service = AccountsService(db)
    return service.login_by_phone(data.phone)


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get current user identity, settings, and workspaces",
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> MeResponse:
    service = AccountsService(db)
    return service.get_me(current_user.id)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user language or name",
)
def update_me(
    data: UpdateMeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> UserResponse:
    service = AccountsService(db)
    return service.update_me(current_user.id, data)


@router.get(
    "/me/capabilities",
    response_model=CapabilitiesResponse,
    summary="Get caller's granted capabilities for a specific workspace",
)
def get_my_capabilities(
    ws: Annotated[str, Query(description="Workspace ID to check capabilities against")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> CapabilitiesResponse:
    service = AccountsService(db)
    return service.get_user_capabilities(ws, current_user.id)


@router.get(
    "/workspaces/{ws}",
    response_model=WorkspaceResponse,
    summary="Get workspace details (scoped to workspace members)",
)
def get_workspace(
    membership: Annotated[Membership, Depends(get_current_workspace_membership)],
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    service = AccountsService(db)
    return service.get_workspace(membership.org_id, membership.user_id)


@router.get(
    "/workspaces/{ws}/members",
    response_model=list[MemberResponse],
    summary="List members in a workspace (scoped to workspace members)",
)
def get_workspace_members(
    membership: Annotated[Membership, Depends(get_current_workspace_membership)],
    db: Session = Depends(get_db),
) -> list[MemberResponse]:
    service = AccountsService(db)
    return service.get_workspace_members(membership.org_id, membership.user_id)
