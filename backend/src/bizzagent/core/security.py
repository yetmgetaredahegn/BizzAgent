"""Cryptographic and authentication security utilities."""

import hashlib
import hmac
import os
import re
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from bizzagent.core.config import settings


def normalize_phone(phone: str) -> str:
    """Normalize phone numbers to international standard format (E.164-like)."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("251"):
        return f"+{digits}"
    if digits.startswith("0") and len(digits) >= 10:
        return f"+251{digits[1:]}"
    if len(digits) == 9 and (digits.startswith("9") or digits.startswith("7")):
        return f"+251{digits}"
    return f"+{digits}"


def hash_phone(phone: str) -> str:
    """Compute a SHA-256 hash of the normalized phone number for privacy-preserving lookup."""
    normalized = normalize_phone(phone)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 600_000)
    return f"pbkdf2_sha256$600000${salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored PBKDF2-HMAC-SHA256 hash."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_key = bytes.fromhex(parts[3])
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(UTC)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_expire_minutes)

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a signed JWT access token.

    Raises jwt.PyJWTError (e.g. ExpiredSignatureError, InvalidTokenError) on failure.
    """
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
