from datetime import datetime, timezone
from typing import Any


def to_midnight(dt):
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def calculate_streak_changes(
    entry_date: datetime,
    last_journal_date: datetime | None = None,
    current_streak_start: datetime | None = None,
    longest_streak: int = 0,
) -> dict[str, Any]:
    """
    Calculate streak changes based on a new journal entry.

    Args:
        entry_date: The date of the new journal entry
        last_journal_date: The date of the user's last journal entry
        current_streak_start: The start date of the current streak
        longest_streak: The longest streak achieved

    Returns:
        Dictionary with streak updates to be applied to the user record
    """
    update_doc = {}
    entry_day = to_midnight(entry_date)

    # Check for existing last journal date
    if last_journal_date:
        # MongoDB loses timezone info:
        last_date = to_midnight(last_journal_date)
        days_diff = (entry_day - last_date).days

        if days_diff == 1:
            streak_start = to_midnight(current_streak_start) if current_streak_start else None
            # Consecutive day - streak continues
            # If no streak in progress, start one
            if not streak_start:
                update_doc["currentStreakStart"] = last_date
                update_doc["currentStreak"] = 2  # Yesterday + today
            else:
                # Calculate streak directly from start date
                new_streak = (entry_day - streak_start).days + 1
                update_doc["currentStreak"] = new_streak

                # Update longest streak if needed
                if new_streak > longest_streak:
                    update_doc["longestStreak"] = new_streak
        elif days_diff:
            # Streak broken, reset if journaling today
            if entry_day == to_midnight(datetime.now(timezone.utc)):
                update_doc.update({"currentStreakStart": entry_day, "currentStreak": 1})
            else:
                update_doc.update({"currentStreakStart": None, "currentStreak": 0})
    else:
        # First journal entry ever
        update_doc.update({"currentStreakStart": entry_day, "currentStreak": 1, "longestStreak": 1})

    # Always update last journal date if we have any changes
    if update_doc:
        update_doc["lastJournalDate"] = entry_day

    return update_doc
