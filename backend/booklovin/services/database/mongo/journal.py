"""Database helpers for mongo: posts"""

from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, NewJournalEntry, Mood
from pymongo.asynchronous.database import AsyncDatabase as Database
from booklovin.services import errors


async def create(db: Database, entry: JournalEntry) -> None | UserError:
    await db.journals.insert_one(entry.model_dump())
    return None


async def delete(db: Database, entry_id: str) -> None | UserError:
    """Delete a journal entry by ID."""
    result = await db.journals.delete_one({"uid": entry_id})
    if result.deleted_count == 0:
        return errors.NOT_FOUND
    return None


async def update(db: Database, author_id: str, entry_id: str, journal_entry: NewJournalEntry) -> None | UserError:
    """Update an existing journal entry."""
    update_data = journal_entry.model_dump(exclude_unset=True)  # Only update provided fields
    result = await db.journals.update_one({"uid": entry_id, "authorId": author_id}, {"$set": update_data})
    if result.matched_count == 0:
        return errors.NOT_FOUND
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
