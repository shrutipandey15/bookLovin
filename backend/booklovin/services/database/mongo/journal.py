"""Database helpers for mongo: posts"""

from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, JournalEntryUpdate, Mood
from pymongo.asynchronous.database import AsyncDatabase as Database
from booklovin.services import errors
from datetime import datetime, timezone
from booklovin.models.users import User


def to_midnight(dt):
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


async def trigger_new_journal_actions(db: Database, user: User, entry_date: datetime):
    """
    Update and calculate the user's journaling streak based on a new entry.

    Takes the created_at timestamp of the journal entry and updates the user's
    streaks accordingly using a currentStreakStart field.
    """

    # Initialize update document
    update_doc = {}
    entry_day = to_midnight(entry_date)

    # Check for existing last journal date
    if user.lastJournalDate:
        # Mongo looses timezone info:
        last_date = to_midnight(user.lastJournalDate.replace(tzinfo=timezone.utc))
        days_diff = (entry_day - last_date).days

        if days_diff == 1:
            streak_start = to_midnight(user.currentStreakStart.replace(tzinfo=timezone.utc)) if user.currentStreakStart else None
            # Consecutive day - streak continues
            # If no streak in progress, start one
            if not streak_start:
                update_doc["currentStreakStart"] = last_date
                update_doc["currentStreak"] = 2  # Yesterday + today
            else:
                # Calculate streak directly from start date
                currentStreak = (entry_day - streak_start).days + 1
                update_doc["currentStreak"] = currentStreak

                # Update longest streak if needed
                if currentStreak > user.longestStreak:
                    update_doc["longestStreak"] = currentStreak
        elif days_diff:
            # Streak broken, reset if journaling today
            if entry_day == to_midnight(datetime.now(timezone.utc)):
                update_doc.update({"currentStreakStart": entry_day, "currentStreak": 1})
            else:
                update_doc.update({"currentStreakStart": None, "currentStreak": 0})
    else:
        # First journal entry ever
        update_doc.update({"currentStreakStart": entry_day, "currentStreak": 1, "longestStreak": 1})

    # Only update if we have changes
    if update_doc:
        update_doc["lastJournalDate"] = entry_day
        await db.users.update_one({"uid": user.uid}, {"$set": update_doc})


async def create(db: Database, entry: JournalEntry, user: User) -> None | UserError:
    await db.journals.insert_one(entry.model_dump())
    await trigger_new_journal_actions(db, user, entry.creationTime)
    return None


async def delete(db: Database, entry_id: str) -> None | UserError:
    """Delete a journal entry by ID."""
    result = await db.journals.delete_one({"uid": entry_id})
    if result.deleted_count == 0:
        return errors.NOT_FOUND
    return None


async def update(db: Database, user: User, entry_id: str, journal_entry: JournalEntryUpdate) -> None | UserError:
    """Update an existing journal entry."""
    update_data = journal_entry.model_dump(exclude_unset=True)
    update_data["updatedAt"] = datetime.now(timezone.utc)
    result = await db.journals.update_one({"uid": entry_id, "authorId": user.uid}, {"$set": update_data})
    if result.matched_count == 0:
        return errors.NOT_FOUND

    existing_entry_doc = await db.journals.find_one({"uid": entry_id, "authorId": user.uid})
    if existing_entry_doc:
        existing_entry = JournalEntry.from_dict(existing_entry_doc)
        await trigger_new_journal_actions(db, user, existing_entry.creationTime)
    return None


async def query(
    db: Database, user_id: str, mood: Mood | None = None, search: str | None = None, favorite: bool | None = None
) -> list[JournalEntry] | UserError:
    """List journal entries with optional filtering."""
    query = {"authorId": user_id}

    if mood:
        query["mood"] = mood.value  # type: ignore
    if search:
        query["$text"] = {"$search": search}  # type: ignore
    if favorite is not None:
        query["favorite"] = favorite  # type: ignore

    entries = await db.journals.find(query).to_list()

    if not entries:
        return []

    return [JournalEntry.from_dict(entry) for entry in entries]
