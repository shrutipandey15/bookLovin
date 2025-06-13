"""Database helpers for mongo: posts"""

from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, JournalEntryUpdate, Mood
from pymongo.asynchronous.database import AsyncDatabase as Database
from booklovin.services import errors
from datetime import datetime, timezone
from booklovin.models.users import User


async def _update_user_streak(db: Database, user: User, entry_created_at: datetime):
    """
    Calculates and updates the user's journaling streak based on a new/updated entry.
    entry_created_at should be the created_at timestamp of the journal entry.
    """
    # Ensure entry_created_at is timezone aware
    if entry_created_at.tzinfo is None:
        entry_created_at = entry_created_at.replace(tzinfo=timezone.utc)

    # Normalize entry_created_at to midnight UTC
    entry_date_midnight = entry_created_at.replace(hour=0, minute=0, second=0, microsecond=0)

    today_midnight = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    last_journal_date_midnight = None
    if user.last_journal_date:
        # Ensure last_journal_date is timezone aware
        if user.last_journal_date.tzinfo is None:
            last_journal_date = user.last_journal_date.replace(tzinfo=timezone.utc)
        else:
            last_journal_date = user.last_journal_date
        last_journal_date_midnight = last_journal_date.replace(hour=0, minute=0, second=0, microsecond=0)

    new_current_streak = user.current_streak
    new_longest_streak = user.longest_streak

    if not last_journal_date_midnight:
        new_current_streak = 1
    else:
        delta = entry_date_midnight - last_journal_date_midnight
        days_diff = delta.days

        if days_diff == 0:
            pass
        elif days_diff == 1:
            new_current_streak += 1
        else:
            if entry_date_midnight == today_midnight:
                new_current_streak = 1
            else:
                new_current_streak = 0

    if new_current_streak > new_longest_streak:
        new_longest_streak = new_current_streak

    if (
        new_current_streak != user.current_streak
        or new_longest_streak != user.longest_streak
        or (last_journal_date_midnight is None and entry_date_midnight is not None)  # First entry case
        or (last_journal_date_midnight is not None and entry_date_midnight != last_journal_date_midnight)
    ):
        update_fields = {
            "last_journal_date": entry_date_midnight,
            "current_streak": new_current_streak,
            "longest_streak": new_longest_streak,
        }
        await db.users.update_one({"uid": user.uid}, {"$set": update_fields})


async def create(db: Database, entry: JournalEntry, user: User) -> None | UserError:
    await db.journals.insert_one(entry.model_dump())
    await _update_user_streak(db, user, entry.creationTime)
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
    result = await db.journals.update_one({"uid": entry_id, "authorid": user.uid}, {"$set": update_data})
    if result.matched_count == 0:
        return errors.NOT_FOUND

    existing_entry_doc = await db.journals.find_one({"uid": entry_id, "authorId": user.uid})
    if existing_entry_doc:
        existing_entry = JournalEntry.from_dict(existing_entry_doc)
        await _update_user_streak(db, user, existing_entry.creationTime)
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
