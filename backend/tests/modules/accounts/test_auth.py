"""Tests for Authentication, token lifecycle, and account management."""

from datetime import timedelta

import jwt
import pytest
from fastapi.testclient import TestClient

from bizzagent.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    hash_phone,
    normalize_phone,
    verify_password,
)

# --- Unit Tests for Cryptography and Token Utilities ---


def test_phone_normalization() -> None:
    assert normalize_phone("+251911223344") == "+251911223344"
    assert normalize_phone("0911223344") == "+251911223344"
    assert normalize_phone("911223344") == "+251911223344"
    assert normalize_phone("0911 22 33 44") == "+251911223344"


def test_phone_hashing_is_deterministic() -> None:
    hash1 = hash_phone("0911223344")
    hash2 = hash_phone("+251911223344")
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA-256


def test_password_hashing_and_verification() -> None:
    raw = "correct-horse-battery-staple"
    hashed = hash_password(raw)
    assert hashed != raw
    assert hashed.startswith("pbkdf2_sha256$600000$")
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong-password", hashed) is False
    assert verify_password(raw, "corrupted$hash") is False


def test_token_creation_and_decoding() -> None:
    token = create_access_token(
        subject="usr_test123",
        extra_claims={"lang": "am", "role": "founder"},
    )
    payload = decode_access_token(token)
    assert payload["sub"] == "usr_test123"
    assert payload["lang"] == "am"
    assert payload["role"] == "founder"
    assert "exp" in payload


def test_token_expiration_rejected() -> None:
    expired_token = create_access_token(
        subject="usr_expired",
        expires_delta=timedelta(seconds=-10),  # expired in past
    )
    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired_token)


def test_tampered_token_rejected() -> None:
    valid_token = create_access_token(subject="usr_valid")
    parts = valid_token.split(".")
    tampered_token = f"{parts[0]}.{parts[1]}wrong.{parts[2]}"
    with pytest.raises(jwt.PyJWTError):
        decode_access_token(tampered_token)


# --- Integration / API Tests ---


def test_register_account_success(client: TestClient) -> None:
    """FR-ACC-001 & FR-ACC-002: Create account with phone, language, and workspace."""
    payload = {
        "phone": "+251911000001",
        "language": "am",
        "path": "business",
        "legalForm": "one_member_plc",
        "name": "Almaz Textiles",
        "profile": {"business": "Almaz Textiles", "town": "Hawassa"},
    }
    response = client.post("/v1/accounts", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "token" in data
    assert "user" in data
    assert "workspace" in data

    user = data["user"]
    assert user["language"] == "am"
    assert user["name"] == "Almaz Textiles"
    assert user["id"].startswith("usr_")

    ws = data["workspace"]
    assert ws["type"] == "business"
    assert ws["legalForm"] == "one_member_plc"
    assert ws["name"] == "Almaz Textiles"
    assert ws["id"].startswith("ws_")


def test_duplicate_phone_registration_rejected(client: TestClient) -> None:
    """Duplicate phone registrations must be rejected with 409 conflict."""
    payload = {
        "phone": "+251911000002",
        "language": "en",
        "path": "explorer",
    }
    res1 = client.post("/v1/accounts", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/v1/accounts", json=payload)
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "phone_already_registered"


def test_invalid_workspace_path_rejected(client: TestClient) -> None:
    payload = {
        "phone": "+251911000003",
        "language": "en",
        "path": "invalid_path_type",
    }
    res = client.post("/v1/accounts", json=payload)
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "invalid_workspace_type"


def test_login_by_registered_phone(client: TestClient) -> None:
    """Sign-in flow using a registered phone number."""
    client.post(
        "/v1/accounts",
        json={
            "phone": "0911000004",
            "language": "om",
            "path": "team",
            "name": "Finfinnee Tech",
        },
    )

    # Sign in with different formatting of the same number
    res = client.post("/v1/accounts/login", json={"phone": "+251 911 000 004"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["language"] == "om"
    assert data["workspace"]["name"] == "Finfinnee Tech"


def test_login_unregistered_phone_rejected(client: TestClient) -> None:
    res = client.post("/v1/accounts/login", json={"phone": "+251999999999"})
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "unauthorized"


def test_anonymous_access_to_me_rejected(client: TestClient) -> None:
    res = client.get("/v1/me")
    assert res.status_code == 401


def test_invalid_bearer_token_rejected(client: TestClient) -> None:
    headers = {"Authorization": "Bearer invalid.token.payload"}
    res = client.get("/v1/me", headers=headers)
    assert res.status_code == 401


def test_get_me_and_patch_me(client: TestClient) -> None:
    # Register
    reg = client.post(
        "/v1/accounts",
        json={
            "phone": "+251911000005",
            "language": "en",
            "path": "business",
            "name": "Hiwot Agro",
        },
    ).json()

    token = reg["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /me
    me_res = client.get("/v1/me", headers=headers)
    assert me_res.status_code == 200
    me = me_res.json()
    assert me["user"]["name"] == "Hiwot Agro"
    assert len(me["workspaces"]) == 1
    assert me["workspaces"][0]["role"] == "owner"
    assert me["workspaces"][0]["signatory"] is True
    assert me["personal_space_id"].startswith("ps_")

    # PATCH /me
    patch_res = client.patch(
        "/v1/me", json={"language": "om", "name": "Hiwot Enterprise"}, headers=headers
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["language"] == "om"
    assert updated["name"] == "Hiwot Enterprise"
