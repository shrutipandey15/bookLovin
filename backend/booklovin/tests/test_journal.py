"""Tests for the journal API endpoints."""

import pytest
from booklovin.tests.conftest import assert_success


@pytest.mark.asyncio
async def test_create_journal(aclient):
    """Test creating a new journal entry."""

    payload = {
        "title": "Test journal entry",
        "content": "This is a test journal entry containing very interesting text.",
        "mood": 2,
    }
    response = await aclient.post("/api/v1/journal/", json=payload)

    assert_success(response)
    data = response.json()
    assert "uid" in data
    assert data["creationTime"]
