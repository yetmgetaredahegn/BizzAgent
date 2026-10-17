"""Application service coordinating Accounts use cases."""

import re

from sqlalchemy.orm import Session

from bizzagent.core.errors import ConflictException, NotFoundException, UnauthorizedException
from bizzagent.core.security import create_access_token, hash_phone, normalize_phone
from bizzagent.modules.accounts.models import Membership, Organization, PersonalSpace, User
from bizzagent.modules.accounts.repository import AccountsRepository
from bizzagent.modules.accounts.rules import (
    VALID_LEGAL_FORMS,
    VALID_PARTNER_KINDS,
    VALID_WORKSPACE_TYPES,
    get_capabilities_for_role,
)
from bizzagent.modules.accounts.schemas import (
    AuthResponse,
    CapabilitiesResponse,
    CreateAccountRequest,
    MemberResponse,
    MeResponse,
    UpdateMeRequest,
    UserResponse,
    WorkspaceResponse,
    WorkspaceSummary,
)


def _slugify(text: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", cleaned) or "workspace"


class AccountsService:
    """Service orchestrating business capabilities for users and workspaces."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AccountsRepository(db)

    def register_account(self, data: CreateAccountRequest) -> AuthResponse:
        """Register a new user identity, personal space, and primary workspace."""
        if data.path not in VALID_WORKSPACE_TYPES:
            raise ConflictException(
                f"Invalid workspace path '{data.path}'. Must be one of {VALID_WORKSPACE_TYPES}",
                code="invalid_workspace_type",
            )
        if data.legal_form and data.legal_form not in VALID_LEGAL_FORMS:
            raise ConflictException(
                f"Invalid legal form '{data.legal_form}'.",
                code="invalid_legal_form",
            )
        if data.partner_kind and data.partner_kind not in VALID_PARTNER_KINDS:
            raise ConflictException(
                f"Invalid partner kind '{data.partner_kind}'.",
                code="invalid_partner_kind",
            )

        norm_phone = normalize_phone(data.phone)
        phone_hash = hash_phone(norm_phone)

        existing_user = self.repo.get_user_by_phone_hash(phone_hash)
        if existing_user:
            raise ConflictException(
                "An account with this phone number already exists.",
                code="phone_already_registered",
            )

        # 1. Create User
        user = User(
            phone_hash=phone_hash,
            phone_number=norm_phone,
            language=data.language if data.language in {"en", "am", "om"} else "en",
            name=data.name,
        )
        self.repo.create_user(user)

        # 2. Create Personal Space
        ps = PersonalSpace(user_id=user.id)
        self.repo.create_personal_space(ps)

        # 3. Create Organization
        business_name = None
        if data.profile and isinstance(data.profile, dict):
            business_name = data.profile.get("business")

        org_name = data.name or business_name or f"{data.path.capitalize()} Workspace"
        org_slug = _slugify(org_name)
        org_kind = "partner" if data.path == "partner" else "venture"

        org = Organization(
            kind=org_kind,
            type=data.path,
            legal_form=data.legal_form,
            partner_kind=data.partner_kind,
            name=org_name,
            slug=f"{org_slug}-{user.id[-4:]}",
            stage="idea",
        )
        self.repo.create_organization(org)

        # 4. Create Membership as Owner
        membership = Membership(
            org_id=org.id,
            user_id=user.id,
            role="owner",
            authorised_signatory=True,
        )
        self.repo.create_membership(membership)

        self.db.commit()

        token = create_access_token(
            subject=user.id,
            extra_claims={"lang": user.language},
        )

        user_res = UserResponse.model_validate(user)
        ws_res = WorkspaceResponse(
            id=org.id,
            kind=org.kind,
            type=org.type,
            legalForm=org.legal_form,
            partnerKind=org.partner_kind,
            name=org.name,
            slug=org.slug,
            stage=org.stage,
            members_count=1,
        )

        return AuthResponse(user=user_res, token=token, workspace=ws_res)

    def login_by_phone(self, phone: str) -> AuthResponse:
        """Authenticate user by phone number and return an active session."""
        norm_phone = normalize_phone(phone)
        phone_hash = hash_phone(norm_phone)
        user = self.repo.get_user_by_phone_hash(phone_hash)
        if not user:
            raise UnauthorizedException("No account found matching this phone number.")

        memberships = self.repo.get_user_memberships(user.id)
        if not memberships:
            raise NotFoundException("User has no associated workspaces.")

        primary_org = self.repo.get_organization(memberships[0].org_id)
        if not primary_org:
            raise NotFoundException("Workspace not found.")

        token = create_access_token(
            subject=user.id,
            extra_claims={"lang": user.language},
        )

        user_res = UserResponse.model_validate(user)
        ws_res = WorkspaceResponse(
            id=primary_org.id,
            kind=primary_org.kind,
            type=primary_org.type,
            legalForm=primary_org.legal_form,
            partnerKind=primary_org.partner_kind,
            name=primary_org.name,
            slug=primary_org.slug,
            stage=primary_org.stage,
            members_count=len(self.repo.list_organization_members(primary_org.id)),
        )

        return AuthResponse(user=user_res, token=token, workspace=ws_res)

    def get_me(self, user_id: str) -> MeResponse:
        """Retrieve the authenticated user's profile and workspaces."""
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")

        memberships = self.repo.get_user_memberships(user.id)
        workspaces_summary: list[WorkspaceSummary] = []

        for m in memberships:
            org = self.repo.get_organization(m.org_id)
            if org:
                workspaces_summary.append(
                    WorkspaceSummary(
                        id=org.id,
                        name=org.name,
                        type=org.type,
                        legalForm=org.legal_form,
                        partnerKind=org.partner_kind,
                        role=m.role,
                        signatory=m.authorised_signatory,
                        stage=org.stage,
                    )
                )

        ps = self.repo.get_personal_space(user.id)
        personal_space_id = ps.id if ps else ""

        return MeResponse(
            user=UserResponse.model_validate(user),
            language=user.language,
            workspaces=workspaces_summary,
            personal_space_id=personal_space_id,
        )

    def update_me(self, user_id: str, data: UpdateMeRequest) -> UserResponse:
        """Update the current user's profile information."""
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")

        if data.language and data.language in {"en", "am", "om"}:
            user.language = data.language
        if data.name is not None:
            user.name = data.name

        self.repo.update_user(user)
        self.db.commit()
        return UserResponse.model_validate(user)

    def get_workspace(self, ws_id: str, user_id: str) -> WorkspaceResponse:
        """Fetch workspace details, verifying membership access (404 on un-authorized)."""
        membership = self.repo.get_membership(ws_id, user_id)
        if not membership:
            # Per NFR-TEN-001: requests outside caller's memberships return 404, not 403
            raise NotFoundException("Workspace not found.")

        org = self.repo.get_organization(ws_id)
        if not org:
            raise NotFoundException("Workspace not found.")

        members_count = len(self.repo.list_organization_members(org.id))
        return WorkspaceResponse(
            id=org.id,
            kind=org.kind,
            type=org.type,
            legalForm=org.legal_form,
            partnerKind=org.partner_kind,
            name=org.name,
            slug=org.slug,
            stage=org.stage,
            members_count=members_count,
        )

    def get_workspace_members(self, ws_id: str, user_id: str) -> list[MemberResponse]:
        """List all members in a workspace, verifying membership access."""
        membership = self.repo.get_membership(ws_id, user_id)
        if not membership:
            raise NotFoundException("Workspace not found.")

        memberships = self.repo.list_organization_members(ws_id)
        results: list[MemberResponse] = []
        for m in memberships:
            u = self.repo.get_user_by_id(m.user_id)
            results.append(
                MemberResponse(
                    user_id=m.user_id,
                    name=u.name if u else None,
                    role=m.role,
                    authorised_signatory=m.authorised_signatory,
                )
            )
        return results

    def get_user_capabilities(self, ws_id: str, user_id: str) -> CapabilitiesResponse:
        """Return the capability list granted to the user in this workspace."""
        membership = self.repo.get_membership(ws_id, user_id)
        if not membership:
            raise NotFoundException("Workspace not found.")

        caps = get_capabilities_for_role(
            membership.role,
            is_signatory=membership.authorised_signatory,
        )
        return CapabilitiesResponse(capabilities=caps)
