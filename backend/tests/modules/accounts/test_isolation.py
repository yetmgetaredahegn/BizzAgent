"""Tests for workspace isolation and tenancy boundaries.

Verifies requirement NFR-TEN-001: requests outside the caller's memberships return 404, not 403.
"""

from fastapi.testclient import TestClient


def test_workspace_isolation_blocks_cross_workspace_access(client: TestClient) -> None:
    """NFR-TEN-001: User A cannot read Workspace B's data; returns 404, not 403."""
    # Create User A with Workspace A
    res_a = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000010",
            "language": "en",
            "path": "business",
            "name": "Org A",
        },
    ).json()
    token_a = res_a["token"]
    ws_a = res_a["workspace"]["id"]

    # Create User B with Workspace B
    res_b = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000020",
            "language": "am",
            "path": "business",
            "name": "Org B",
        },
    ).json()
    token_b = res_b["token"]
    ws_b = res_b["workspace"]["id"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A can access Workspace A
    assert client.get(f"/v1/workspaces/{ws_a}", headers=headers_a).status_code == 200

    # User B can access Workspace B
    assert client.get(f"/v1/workspaces/{ws_b}", headers=headers_b).status_code == 200

    # User A CANNOT access Workspace B -> Must return 404 (NFR-TEN-001)
    cross_res = client.get(f"/v1/workspaces/{ws_b}", headers=headers_a)
    assert cross_res.status_code == 404

    # User B CANNOT access Workspace A -> Must return 404
    cross_res_b = client.get(f"/v1/workspaces/{ws_a}", headers=headers_b)
    assert cross_res_b.status_code == 404


def test_member_listing_scoped_to_workspace(client: TestClient) -> None:
    """Listing members of a workspace is permitted only to authorized members."""
    res_a = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000030",
            "language": "en",
            "path": "business",
            "name": "Org A",
        },
    ).json()
    token_a = res_a["token"]
    ws_a = res_a["workspace"]["id"]

    res_b = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000040",
            "language": "en",
            "path": "business",
            "name": "Org B",
        },
    ).json()
    token_b = res_b["token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A can list members of Org A
    members_res = client.get(f"/v1/workspaces/{ws_a}/members", headers=headers_a)
    assert members_res.status_code == 200
    members = members_res.json()
    assert len(members) == 1
    assert members[0]["role"] == "owner"
    assert members[0]["authorised_signatory"] is True

    # User B cannot list members of Org A (returns 404)
    assert client.get(f"/v1/workspaces/{ws_a}/members", headers=headers_b).status_code == 404


def test_capabilities_endpoint(client: TestClient) -> None:
    """GET /me/capabilities?ws={ws} returns the capability list for caller in that workspace."""
    res = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000050",
            "language": "en",
            "path": "business",
            "name": "Capabilities Org",
        },
    ).json()
    token = res["token"]
    ws_id = res["workspace"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    cap_res = client.get(f"/v1/me/capabilities?ws={ws_id}", headers=headers)
    assert cap_res.status_code == 200
    caps = cap_res.json()["capabilities"]
    assert "submit_and_sign" in caps
    assert "manage_members" in caps
    assert "view_finances" in caps

    # Querying capabilities for an unknown or unauthorized workspace returns 404
    assert client.get("/v1/me/capabilities?ws=ws_nonexistent", headers=headers).status_code == 404
