"""Pydantic schemas for the Accounts module API contract."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CreateAccountRequest(BaseModel):
    """Payload to register a new account and primary workspace."""

    phone: str = Field(..., description="User's phone number")
    language: str = Field("en", description="Preferred language (en, am, om)")
    path: str = Field(
        "business",
        description="Workspace type path (explorer, team, business, collective, partner)",
    )
    legal_form: str | None = Field(None, alias="legalForm")
    partner_kind: str | None = Field(None, alias="partnerKind")
    name: str | None = None
    profile: dict[str, Any] | None = None

    model_config = ConfigDict(populate_by_name=True)


class LoginRequest(BaseModel):
    """Payload to authenticate with a registered phone number."""

    phone: str = Field(..., description="Registered phone number")


class UpdateMeRequest(BaseModel):
    """Payload to update the current user's profile."""

    language: str | None = None
    name: str | None = None


class UserResponse(BaseModel):
    """Public user identity contract."""

    id: str
    phone_hash: str
    language: str
    name: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspaceResponse(BaseModel):
    """Full workspace model contract."""

    id: str
    kind: str
    type: str
    legal_form: str | None = Field(None, alias="legalForm")
    partner_kind: str | None = Field(None, alias="partnerKind")
    name: str
    slug: str
    stage: str
    members_count: int = 1

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class WorkspaceSummary(BaseModel):
    """Summary of a workspace for dashboard and navigation."""

    id: str
    name: str
    type: str
    legal_form: str | None = Field(None, alias="legalForm")
    partner_kind: str | None = Field(None, alias="partnerKind")
    role: str
    signatory: bool
    stage: str = "idea"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AuthResponse(BaseModel):
    """Authentication response returning user, auth token, and primary workspace."""

    user: UserResponse
    token: str
    workspace: WorkspaceResponse


class MeResponse(BaseModel):
    """Current authenticated user profile and memberships."""

    user: UserResponse
    language: str
    workspaces: list[WorkspaceSummary]
    personal_space_id: str


class MemberResponse(BaseModel):
    """Workspace membership item."""

    user_id: str
    name: str | None = None
    role: str
    authorised_signatory: bool

    model_config = ConfigDict(from_attributes=True)


class CapabilitiesResponse(BaseModel):
    """List of granted capability names for a workspace."""

    capabilities: list[str]
