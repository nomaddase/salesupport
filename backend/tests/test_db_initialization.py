from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import OperationalError

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import utils


def test_init_database_retries_until_success(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[int] = []

    def fake_create_all(**_: object) -> None:
        calls.append(1)
        if len(calls) < 2:
            raise OperationalError("stmt", {}, Exception("db down"))

    metadata_mock = MagicMock()
    metadata_mock.create_all.side_effect = fake_create_all
    monkeypatch.setattr(utils, "Base", MagicMock(metadata=metadata_mock))

    utils.init_database(max_retries=3, retry_interval=0)

    assert len(calls) == 2
    metadata_mock.create_all.assert_called()


def test_init_database_raises_after_max_retries(monkeypatch: pytest.MonkeyPatch) -> None:
    metadata_mock = MagicMock()
    metadata_mock.create_all.side_effect = OperationalError("stmt", {}, Exception("down"))
    monkeypatch.setattr(utils, "Base", MagicMock(metadata=metadata_mock))

    with pytest.raises(OperationalError):
        utils.init_database(max_retries=2, retry_interval=0)

    assert metadata_mock.create_all.call_count == 2
