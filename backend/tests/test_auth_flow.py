from __future__ import annotations

import importlib
import sys
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import get_settings


@pytest.fixture
def client(
    tmp_path_factory: pytest.TempPathFactory, monkeypatch: pytest.MonkeyPatch
) -> Generator[TestClient, None, None]:
    db_file = tmp_path_factory.mktemp("data", numbered=True) / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")
    monkeypatch.setenv("DEFAULT_ADMIN_CREDENTIALS", "admin@example.com:StrongPass123")
    get_settings.cache_clear()

    db_session = importlib.import_module("app.db.session")
    db_utils = importlib.import_module("app.db.utils")
    importlib.reload(db_session)
    importlib.reload(db_utils)
    module = importlib.import_module("app.main")
    importlib.reload(module)

    with TestClient(module.app) as test_client:
        yield test_client

    get_settings.cache_clear()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("DEFAULT_ADMIN_CREDENTIALS", raising=False)


def test_default_admin_can_login(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        data={"username": "admin@example.com", "password": "StrongPass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_register_and_access_protected_route(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Manager",
            "email": "manager@example.com",
            "password": "MyStrongPass!234",
            "role": "manager",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        data={"username": "manager@example.com", "password": "MyStrongPass!234"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    payload = me_response.json()
    assert payload["user"]["email"] == "manager@example.com"
