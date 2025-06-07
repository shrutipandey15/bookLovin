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


@pytest.mark.asyncio
async def test_list_journal_entries(aclient):
    """Test listing journal entries."""
    # First create some entries
    entries = [
        {
            "title": "Happy day",
            "content": "Today was great!",
            "mood": 2,
            "favorite": True,
        },
        {
            "title": "Bad day",
            "content": "Not so good...",
            "mood": 1,
            "favorite": False,
        },
        {
            "title": "Reading session",
            "content": "Finished that novel about space travel.",
            "mood": 3,
            "favorite": True,
        },
    ]

    # Create all entries
    for entry in entries:
        response = await aclient.post("/api/v1/journal/", json=entry)
        assert_success(response)

    # Test listing all entries
    response = await aclient.get("/api/v1/journal/")
    assert_success(response)
    data = response.json()
    assert len(data) == 3

    # Test filtering by mood
    response = await aclient.get("/api/v1/journal/?mood=2")
    assert_success(response)
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Happy day"

    # Test filtering by favorite
    response = await aclient.get("/api/v1/journal/?favorite=true")
    assert_success(response)
    data = response.json()
    assert len(data) == 2

    # Test search
    response = await aclient.get("/api/v1/journal/?search=novel")
    assert_success(response)
    data = response.json()
    assert len(data) == 1
    assert "novel" in data[0]["content"]


@pytest.mark.skip
@pytest.mark.asyncio
async def test_update_journal_entry(aclient):
    """Test updating a journal entry."""
    # First create an entry
    payload = {
        "title": "Initial title",
        "content": "Initial content",
        "mood": 3,
    }
    response = await aclient.post("/api/v1/journal/", json=payload)
    assert_success(response)
    entry = response.json()
    entry_id = entry["uid"]

    # Update the entry
    updated_payload = {"title": "Updated title", "content": "Updated content", "mood": 2, "favorite": True}
    response = await aclient.put(f"/api/v1/journal/{entry_id}", json=updated_payload)
    assert_success(response)

    # Verify the update
    response = await aclient.get("/api/v1/journal/")
    assert_success(response)
    data = response.json()

    updated_entry = next((e for e in data if e["uid"] == entry_id), None)
    assert updated_entry is not None
    assert updated_entry["title"] == "Updated title"
    assert updated_entry["content"] == "Updated content"
    assert updated_entry["mood"] == 2
    assert updated_entry["favorite"] is True


@pytest.mark.asyncio
async def test_delete_journal_entry(aclient):
    """Test deleting a journal entry."""
    # First create an entry
    payload = {
        "title": "Entry to delete",
        "content": "This entry will be deleted",
        "mood": 2,
    }
    response = await aclient.post("/api/v1/journal/", json=payload)
    assert_success(response)
    entry = response.json()
    entry_id = entry["uid"]

    # Delete the entry
    response = await aclient.delete(f"/api/v1/journal/{entry_id}")
    assert_success(response)

    # Verify it's gone
    response = await aclient.get("/api/v1/journal/")
    assert_success(response)
    data = response.json()
    deleted_entry = next((e for e in data if e["uid"] == entry_id), None)
    assert deleted_entry is None
