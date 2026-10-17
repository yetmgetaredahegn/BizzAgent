"""SQLAlchemy models for the Accounts domain.

Stores user identities, organizations/workspaces, memberships, and personal spaces
according to docs/engineering/data-model.md.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bizzagent.core.database import Base


def _gen_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex}"


class User(Base):
    """User account entity in the 'accounts' schema."""

    __tablename__ = "users"
    __table_args__ = {"schema": "accounts"}

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: _gen_id("usr_"))
    phone_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    language: Mapped[str] = mapped_column(String(8), default="en", nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    memberships: Mapped[list["Membership"]] = relationship(
        "Membership", back_populates="user", cascade="all, delete-orphan"
    )
    personal_space: Mapped["PersonalSpace | None"] = relationship(
        "PersonalSpace", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Organization(Base):
    """Workspace/Organization entity in the 'accounts' schema."""

    __tablename__ = "organizations"
    __table_args__ = {"schema": "accounts"}

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: _gen_id("ws_"))
    kind: Mapped[str] = mapped_column(String(32), default="venture", nullable=False)
    type: Mapped[str] = mapped_column(String(32), default="business", nullable=False)
    legal_form: Mapped[str | None] = mapped_column(String(64), nullable=True)
    partner_kind: Mapped[str | None] = mapped_column(String(64), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    stage: Mapped[str] = mapped_column(String(32), default="idea", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    members: Mapped[list["Membership"]] = relationship(
        "Membership", back_populates="organization", cascade="all, delete-orphan"
    )


class Membership(Base):
    """User membership in a workspace with an assigned role and signatory status."""

    __tablename__ = "memberships"
    __table_args__ = (
        UniqueConstraint("org_id", "user_id", name="uq_accounts_org_user"),
        {"schema": "accounts"},
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: _gen_id("mem_"))
    org_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("accounts.organizations.id"), index=True, nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("accounts.users.id"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(32), default="owner", nullable=False)
    authorised_signatory: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="memberships")
    organization: Mapped["Organization"] = relationship("Organization", back_populates="members")


class PersonalSpace(Base):
    """Private personal space in the isolated 'personal' schema."""

    __tablename__ = "personal_spaces"
    __table_args__ = {"schema": "personal"}

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: _gen_id("ps_"))
    user_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("accounts.users.id"), unique=True, index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="personal_space")
