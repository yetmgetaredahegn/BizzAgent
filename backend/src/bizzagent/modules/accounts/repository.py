"""Database persistence layer for the Accounts module."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from bizzagent.modules.accounts.models import Membership, Organization, PersonalSpace, User


class AccountsRepository:
    """Repository handling database operations for the accounts schema."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_user_by_phone_hash(self, phone_hash: str) -> User | None:
        return self.db.scalars(select(User).where(User.phone_hash == phone_hash)).first()

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.scalars(select(User).where(User.id == user_id)).first()

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def update_user(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def create_organization(self, org: Organization) -> Organization:
        self.db.add(org)
        self.db.flush()
        return org

    def get_organization(self, org_id: str) -> Organization | None:
        return self.db.scalars(select(Organization).where(Organization.id == org_id)).first()

    def create_membership(self, membership: Membership) -> Membership:
        self.db.add(membership)
        self.db.flush()
        return membership

    def get_membership(self, org_id: str, user_id: str) -> Membership | None:
        stmt = select(Membership).where(
            Membership.org_id == org_id,
            Membership.user_id == user_id,
        )
        return self.db.scalars(stmt).first()

    def get_user_memberships(self, user_id: str) -> list[Membership]:
        stmt = select(Membership).where(Membership.user_id == user_id)
        return list(self.db.scalars(stmt).all())

    def list_organization_members(self, org_id: str) -> list[Membership]:
        stmt = select(Membership).where(Membership.org_id == org_id)
        return list(self.db.scalars(stmt).all())

    def create_personal_space(self, ps: PersonalSpace) -> PersonalSpace:
        self.db.add(ps)
        self.db.flush()
        return ps

    def get_personal_space(self, user_id: str) -> PersonalSpace | None:
        stmt = select(PersonalSpace).where(PersonalSpace.user_id == user_id)
        return self.db.scalars(stmt).first()
