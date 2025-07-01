from datetime import datetime, timezone
from typing import Any


def to_midnight(dt):
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def calculate_streak_changes(
    entry_date: datetime,
    last_journal_date: datetime | None = None,
    current_streak_start: datetime | None = None,
    current_streak: int = 0,
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
    if last_journal_date is None:
        update_doc["currentStreakStart"] = entry_day
        update_doc["currentStreak"] = 1
        update_doc["longestStreak"] = 1
    else:
        last_date = to_midnight(last_journal_date)
        days_diff = (entry_day - last_date).days

        # If entry is for the same day, do nothing
        if days_diff == 0:
            return {}

        # If entry is for the next day, continue the streak
        elif days_diff == 1:
            # If no streak was in progress, this is day 2
            if not current_streak_start:
                update_doc["currentStreakStart"] = last_date
                update_doc["currentStreak"] = 2
            else:
                # Otherwise, increment existing streak
                update_doc["currentStreak"] = current_streak + 1

            # Update longest streak if the new streak is greater
            if update_doc.get("currentStreak", current_streak + 1) > longest_streak:
                update_doc["longestStreak"] = update_doc.get("currentStreak", current_streak + 1)
        
        # If a day or more was missed, streak is broken. Start a new one.
        else:
            update_doc["currentStreakStart"] = entry_day
            update_doc["currentStreak"] = 1
            
    # Always update the last journal date if a new day's entry is made
    if update_doc:
        update_doc["lastJournalDate"] = entry_day

    return update_doc
