"""Tests for the streak functionality in user journals."""

import pytest
from datetime import datetime
from freezegun import freeze_time
from booklovin.tests.conftest import assert_success

ME_PAGE = "/api/v1/auth/me"


@pytest.mark.asyncio
async def test_streak_starts_at_zero(aclient):
    """Test that a user's streak starts at zero."""
    # Check current user info
    response = await aclient.get(ME_PAGE)
    assert_success(response)
    user_data = response.json()

    # Verify initial streak values
    assert user_data["currentStreak"] == 0
    assert user_data["longestStreak"] == 0
    assert user_data["currentStreakStart"] is None
    assert user_data["lastJournalDate"] is None


@pytest.mark.asyncio
async def test_streak_increments_on_first_entry(aclient):
    """Test that streak starts when user creates first journal entry."""
    # Freeze time to a specific date
    with freeze_time("2023-01-01 12:00:00"):
        # Create a journal entry
        payload = {
            "title": "First entry",
            "content": "Starting my streak today!",
            "mood": 3,
        }
        response = await aclient.post("/api/v1/journal/", json=payload)
        assert_success(response)

        # Check user info
        response = await aclient.get(ME_PAGE)
        assert_success(response)
        user_data = response.json()

        # Verify streak was incremented
        assert user_data["currentStreak"] == 1
        assert user_data["longestStreak"] == 1
        creation_day = datetime(2023, 1, 1)
    assert datetime.fromtimestamp(user_data["currentStreakStart"]) == creation_day
    assert datetime.fromtimestamp(user_data["lastJournalDate"]) == creation_day


@pytest.mark.asyncio
async def test_streak_breaks_on_missed_day(aclient):
    """Test that streak resets when user misses a day."""
    for n in range(1, 25, 2):
        with freeze_time(f"2023-01-{n:02d} 12:00:00"):
            payload = {"title": "Day 1", "content": "First day", "mood": 3}
            await aclient.post("/api/v1/journal/", json=payload)

    response = await aclient.get(ME_PAGE)
    assert_success(response)
    user_data = response.json()

    # Verify streak was reset and started again
    assert user_data["currentStreak"] == 1
    assert user_data["longestStreak"] == 1  # Should be 1 since we're resetting test data each time
    assert datetime.fromtimestamp(user_data["currentStreakStart"]) == datetime(2023, 1, n)
    assert datetime.fromtimestamp(user_data["lastJournalDate"]) == datetime(2023, 1, n)


@pytest.mark.asyncio
async def test_streak_continues_on_consecutive_days(aclient):
    """Test that streak increments when entries are created on consecutive days."""

    # Day 1
    with freeze_time("2023-01-01 12:00:00"):
        payload = {"title": "Day 1", "content": "First day", "mood": 3}
        assert_success(await aclient.post("/api/v1/journal/", json=payload))

    # Day 2
    with freeze_time("2023-01-02 18:30:00"):
        payload = {"title": "Day 2", "content": "Second day", "mood": 2}
        assert_success(await aclient.post("/api/v1/journal/", json=payload))

        response = await aclient.get(ME_PAGE)
        assert_success(response)
        user_data = response.json()

    # Verify streak was incremented
    assert user_data["currentStreak"] == 2
    assert user_data["longestStreak"] == 2
    assert datetime.fromtimestamp(user_data["currentStreakStart"]) == datetime(2023, 1, 1)
    assert datetime.fromtimestamp(user_data["lastJournalDate"]) == datetime(2023, 1, 2)


@pytest.mark.asyncio
async def test_longestStreak_tracking(aclient):
    """Test that longest streak is tracked correctly when current streak breaks."""
    # Build a 3-day streak
    with freeze_time("2023-01-01 12:00:00"):
        await aclient.post("/api/v1/journal/", json={"title": "Day 1", "content": "First day", "mood": 3})

    with freeze_time("2023-01-02 12:00:00"):
        await aclient.post("/api/v1/journal/", json={"title": "Day 2", "content": "Second day", "mood": 3})

    with freeze_time("2023-01-03 12:00:00"):
        await aclient.post("/api/v1/journal/", json={"title": "Day 3", "content": "Third day", "mood": 3})

        # Check streak is 3
        response = await aclient.get(ME_PAGE)
        user_data = response.json()
        assert user_data["currentStreak"] == 3
        assert user_data["longestStreak"] == 3

    # Skip a day, breaking the streak
    with freeze_time("2023-01-05 12:00:00"):
        await aclient.post("/api/v1/journal/", json={"title": "Day 5", "content": "After break", "mood": 3})

        # Check current streak reset but longest remains
        response = await aclient.get(ME_PAGE)
        user_data = response.json()
        assert user_data["currentStreak"] == 1
        assert user_data["longestStreak"] == 3
