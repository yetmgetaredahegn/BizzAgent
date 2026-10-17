"""Pure domain rules for accounts, workspace types, roles, and capability matrix.

Adheres strictly to docs/product/roles-and-permissions.md §4.
Contains no I/O, no database access, and no framework dependencies.
"""

from typing import Final

VALID_WORKSPACE_TYPES: Final[set[str]] = {
    "explorer",
    "team",
    "business",
    "collective",
    "partner",
}

VALID_LEGAL_FORMS: Final[set[str]] = {
    "informal",
    "sole_proprietorship",
    "one_member_plc",
    "plc",
    "share_company",
    "general_partnership",
    "limited_partnership",
    "other",
    "cooperative",
    "association_cso",
    "ngo",
    "savings_group",
}

VALID_PARTNER_KINDS: Final[set[str]] = {
    "funder",
    "program",
    "support_org",
}

VALID_VENTURE_ROLES: Final[set[str]] = {
    "owner",
    "co_founder",
    "manager",
    "finance",
    "member",
    "helper",
    "advisor",
    "viewer",
}

VALID_PARTNER_ROLES: Final[set[str]] = {
    "org_admin",
    "program_manager",
    "reviewer",
    "mentor",
}

VALID_PLATFORM_ROLES: Final[set[str]] = {
    "platform_admin",
    "content_reviewer",
    "moderator",
}

ALL_ROLES: Final[set[str]] = VALID_VENTURE_ROLES | VALID_PARTNER_ROLES | VALID_PLATFORM_ROLES

# Capability matrix per docs/product/roles-and-permissions.md §4
# True = allowed; False = forbidden; "signatory" = requires authorised_signatory
CAPABILITY_MATRIX: Final[dict[str, dict[str, bool | str]]] = {
    "manage_members": {
        "owner": True,
        "co_founder": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "edit_profile": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "helper": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "edit_legal_and_cap_table": {
        "owner": True,
        "co_founder": True,
        "platform_admin": True,
    },
    "view_finances": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "helper": True,
        "advisor": True,
        "viewer": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "edit_finances": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "member": True,  # assigned only
        "helper": True,
        "platform_admin": True,
    },
    "run_payroll": {
        "owner": True,
        "co_founder": True,
        "finance": True,
        "platform_admin": True,
    },
    "manage_hiring": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "edit_artifacts": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "member": True,
        "helper": True,
        "program_manager": True,
        "platform_admin": True,
    },
    "submit_and_sign": {
        "owner": "signatory",
        "co_founder": "signatory",
        "org_admin": "signatory",
        "platform_admin": "signatory",
    },
    "share_externally": {
        "owner": True,
        "co_founder": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "comment": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "member": True,
        "helper": True,
        "advisor": True,
        "mentor": True,
        "reviewer": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "view_shared": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "member": True,
        "helper": True,
        "advisor": True,
        "viewer": True,
        "mentor": True,
        "reviewer": True,
        "org_admin": True,
        "platform_admin": True,
    },
    "export": {
        "owner": True,
        "co_founder": True,
        "manager": True,
        "finance": True,
        "helper": True,
        "org_admin": True,
        "platform_admin": True,
    },
}


def has_capability(role: str, capability: str, is_signatory: bool = False) -> bool:
    """Evaluate whether a given role has permission to execute a capability."""
    allowed = CAPABILITY_MATRIX.get(capability, {}).get(role, False)
    if allowed == "signatory":
        return is_signatory
    return bool(allowed)


def get_capabilities_for_role(role: str, is_signatory: bool = False) -> list[str]:
    """Return all capabilities granted to a role."""
    return sorted(
        cap
        for cap, roles in CAPABILITY_MATRIX.items()
        if has_capability(role, cap, is_signatory=is_signatory)
    )
