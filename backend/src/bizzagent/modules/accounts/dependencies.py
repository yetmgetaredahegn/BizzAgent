"""FastAPI request-scoped authentication and authorization dependencies."""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Header, Path
from jwt import PyJWTError
from sqlalchemy.orm import Session

from bizzagent.core.database import get_db
from bizzagent.core.errors import ForbiddenActionException, NotFoundException, UnauthorizedException
from bizzagent.core.security import decode_access_token
from bizzagent.modules.accounts.models import Membership, User
from bizzagent.modules.accounts.repository import AccountsRepository
from bizzagent.modules.accounts.rules import has_capability


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User:
    """Validate Bearer token from Authorization header and return the authenticated User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or malformed Authorization header")

    token = authorization[len("Bearer ") :].strip()
    try:
        payload = decode_access_token(token)
    except PyJWTError as exc:
        raise UnauthorizedException(f"Invalid or expired token: {exc}") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload missing subject")

    repo = AccountsRepository(db)
    user = repo.get_user_by_id(user_id)
    if not user:
        raise UnauthorizedException("User account no longer exists")

    return user


def get_current_workspace_membership(
    ws: Annotated[str, Path(description="Workspace ID")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> Membership:
    """Enforce workspace isolation (NFR-TEN-001).

    Returns the user's membership in the target workspace, or raises 404 if not a member.
    """
    repo = AccountsRepository(db)
    membership = repo.get_membership(ws, current_user.id)
    if not membership:
        raise NotFoundException("Workspace not found")
    return membership


def require_capability(capability: str) -> Callable[..., Membership]:
    """Dependency factory checking that caller has a specific workspace capability."""

    def _dependency(
        membership: Annotated[Membership, Depends(get_current_workspace_membership)],
    ) -> Membership:
        if not has_capability(
            membership.role,
            capability,
            is_signatory=membership.authorised_signatory,
        ):
            raise ForbiddenActionException(
                f"Your role ({membership.role}) does not have permission for '{capability}'"
            )
        return membership

    return _dependency


def require_signatory(
    membership: Annotated[Membership, Depends(get_current_workspace_membership)],
) -> Membership:
    """Enforce that the caller is an authorised signatory for the workspace."""
    if not membership.authorised_signatory:
        raise ForbiddenActionException("Authorised signatory status required for this action")
    return membership
