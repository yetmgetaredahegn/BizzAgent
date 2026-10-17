"""Test fixtures and database setup for Accounts module tests."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from bizzagent.core.database import get_db, init_db
from bizzagent.main import app


@pytest.fixture(scope="session")
def test_engine() -> Engine:
    """Create a persistent in-memory SQLite engine with multi-schema emulation."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def _attach_schemas(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("ATTACH DATABASE ':memory:' AS accounts")
        cursor.execute("ATTACH DATABASE ':memory:' AS personal")
        cursor.close()

    init_db(target_engine=engine)
    return engine


@pytest.fixture
def db_session(test_engine: Engine) -> Generator[Session]:
    """Provide a transactional database session rolled back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session_factory = sessionmaker(bind=connection, autoflush=False, autocommit=False)
    session = session_factory()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient]:
    """TestClient configured with overridden database dependency."""

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
