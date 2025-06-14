"""Database helpers for mongo: posts"""

from datetime import datetime, timezone

from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, JournalEntryUpdate, Mood
from booklovin.models.users import User
from booklovin.services import errors
from booklovin.services.streak_logic import calculate_streak_changes
from pymongo.asynchronous.database import AsyncDatabase as Database


async def trigger_new_journal_actions(db: Database, user: User, entry_date: datetime):
    """
    Update and calculate the user's journaling streak based on a new entry.
    """
    # Calculate streak changes
    streak_data = calculate_streak_changes(
        entry_date=entry_date,
        last_journal_date=user.lastJournalDate.replace(tzinfo=timezone.utc) if user.lastJournalDate else None,
        current_streak_start=user.currentStreakStart.replace(tzinfo=timezone.utc) if user.currentStreakStart else None,
        current_streak=user.currentStreak,
        longest_streak=user.longestStreak,
    )

    # Only update if we have changes
    if streak_data:
        await db.users.update_one({"uid": user.uid}, {"$set": streak_data})


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
