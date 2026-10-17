"""Database engine and session management for BizzAgent."""

from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine, create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from bizzagent.core.config import settings


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy models."""

    pass


def _create_engine(url: str) -> Engine:
    """Create and configure a SQLAlchemy Engine."""
    if url.startswith("sqlite"):
        engine = create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool if ":memory:" in url else None,
        )

        @event.listens_for(engine, "connect")
        def _attach_sqlite_schemas(dbapi_connection: Any, connection_record: Any) -> None:
            # Emulate PostgreSQL multi-schema support in SQLite for unit tests
            cursor = dbapi_connection.cursor()
            cursor.execute("ATTACH DATABASE ':memory:' AS accounts")
            cursor.execute("ATTACH DATABASE ':memory:' AS personal")
            cursor.close()

        return engine

    return create_engine(
        url,
        pool_pre_ping=True,
    )


engine = _create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session]:
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine: Engine = engine) -> None:
    """Initialize schemas and create tables for all registered models."""
    if not str(target_engine.url).startswith("sqlite"):
        with target_engine.begin() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS accounts"))
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS personal"))
    Base.metadata.create_all(bind=target_engine)
