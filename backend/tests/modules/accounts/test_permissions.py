"""Tests for the Accounts capability matrix and signatory rules.

Verifies requirements FR-ACC-003 and FR-ACC-004 against docs/product/roles-and-permissions.md §4.
"""

import pytest

from bizzagent.modules.accounts.rules import (
    ALL_ROLES,
    CAPABILITY_MATRIX,
    VALID_LEGAL_FORMS,
    VALID_PARTNER_KINDS,
    VALID_WORKSPACE_TYPES,
    get_capabilities_for_role,
    has_capability,
)


def test_valid_workspace_types() -> None:
    expected = {"explorer", "team", "business", "collective", "partner"}
    assert VALID_WORKSPACE_TYPES == expected


def test_valid_legal_forms() -> None:
    assert "one_member_plc" in VALID_LEGAL_FORMS
    assert "share_company" in VALID_LEGAL_FORMS
    assert "cooperative" in VALID_LEGAL_FORMS


def test_valid_partner_kinds() -> None:
    assert VALID_PARTNER_KINDS == {"funder", "program", "support_org"}


def test_owner_capabilities() -> None:
    """Owner has full capabilities in a venture workspace."""
    assert has_capability("owner", "manage_members") is True
    assert has_capability("owner", "edit_profile") is True
    assert has_capability("owner", "edit_legal_and_cap_table") is True
    assert has_capability("owner", "view_finances") is True
    assert has_capability("owner", "edit_finances") is True
    assert has_capability("owner", "run_payroll") is True
    assert has_capability("owner", "manage_hiring") is True
    assert has_capability("owner", "edit_artifacts") is True
    assert has_capability("owner", "share_externally") is True
    assert has_capability("owner", "comment") is True
    assert has_capability("owner", "view_shared") is True
    assert has_capability("owner", "export") is True


def test_submit_and_sign_requires_signatory() -> None:
    """FR-ACC-004: Only members flagged authorised_signatory can submit and sign."""
    # Owner without signatory flag cannot sign
    assert has_capability("owner", "submit_and_sign", is_signatory=False) is False
    assert has_capability("owner", "submit_and_sign", is_signatory=True) is True

    # Co-founder with signatory flag can sign
    assert has_capability("co_founder", "submit_and_sign", is_signatory=False) is False
    assert has_capability("co_founder", "submit_and_sign", is_signatory=True) is True

    # Manager, finance, helper, advisor, viewer can NEVER sign, even if mistakenly flagged
    assert has_capability("manager", "submit_and_sign", is_signatory=True) is False
    assert has_capability("finance", "submit_and_sign", is_signatory=True) is False
    assert has_capability("helper", "submit_and_sign", is_signatory=True) is False
    assert has_capability("advisor", "submit_and_sign", is_signatory=True) is False
    assert has_capability("viewer", "submit_and_sign", is_signatory=True) is False


def test_finance_role_cannot_manage_members_or_hiring() -> None:
    """Finance role has access to ledger and payroll, but cannot manage members or hiring."""
    assert has_capability("finance", "view_finances") is True
    assert has_capability("finance", "edit_finances") is True
    assert has_capability("finance", "run_payroll") is True
    assert has_capability("finance", "manage_members") is False
    assert has_capability("finance", "manage_hiring") is False
    assert has_capability("finance", "edit_legal_and_cap_table") is False


def test_viewer_is_strictly_read_only() -> None:
    """Viewer can only view shared items, cannot edit or export."""
    assert has_capability("viewer", "view_shared") is True
    assert has_capability("viewer", "view_finances") is True
    assert has_capability("viewer", "edit_artifacts") is False
    assert has_capability("viewer", "edit_finances") is False
    assert has_capability("viewer", "comment") is False
    assert has_capability("viewer", "export") is False


def test_helper_capabilities() -> None:
    """Helper acts for the owner but cannot edit legal/cap table or manage hiring."""
    assert has_capability("helper", "edit_profile") is True
    assert has_capability("helper", "view_finances") is True
    assert has_capability("helper", "edit_finances") is True
    assert has_capability("helper", "edit_artifacts") is True
    assert has_capability("helper", "comment") is True
    assert has_capability("helper", "export") is True
    assert has_capability("helper", "manage_members") is False
    assert has_capability("helper", "edit_legal_and_cap_table") is False
    assert has_capability("helper", "manage_hiring") is False


@pytest.mark.parametrize("role", sorted(ALL_ROLES))
def test_all_roles_evaluated_without_exception(role: str) -> None:
    """Ensure get_capabilities_for_role succeeds for every role defined in the system."""
    caps = get_capabilities_for_role(role, is_signatory=True)
    assert isinstance(caps, list)
    for cap in caps:
        assert cap in CAPABILITY_MATRIX
