from booklovin.models.errors import UserError, gen_error, ErrorCode
from booklovin.models.journals import JournalEntry, NewJournalEntry, Mood


from .core import State


async def create(db: State, entry: JournalEntry) -> None | UserError:
    """Create a journal entry."""
    if entry.authorId not in db.journal_entries:
        db.journal_entries[entry.authorId] = []
    db.journal_entries[entry.authorId].append(entry)
    db.save()
    return None


async def delete(db: State, entry_id: str) -> None | UserError:
    """Delete a journal entry by ID."""
    # Search through all users' journal entries
    for user_id, entries in db.journal_entries.items():
        for i, entry in enumerate(entries):
            if entry.uid == entry_id:
                # Remove the entry and save
                db.journal_entries[user_id].pop(i)
                db.save()
                return None

    # If we get here, entry wasn't found
    return gen_error(ErrorCode.NOT_FOUND, f"Journal entry with ID {entry_id} not found.")


async def update(db: State, author_id: str, entry_id: str, journal_entry: NewJournalEntry) -> None | UserError:
    """Update an existing journal entry."""

    # Check if user exists
    if author_id not in db.journal_entries:
        return gen_error(ErrorCode.NOT_FOUND, f"No journal entries found for user {author_id}.")

    # Find the entry to update
    for i, entry in enumerate(db.journal_entries[author_id]):
        if entry.uid == entry_id:
            # Replace the entry
            db.journal_entries[author_id][i].update(journal_entry.model_construct())
            db.save()
            return None

    # If we get here, entry wasn't found
    return gen_error(ErrorCode.NOT_FOUND, f"Journal entry with ID {journal_entry.uid} not found.")


async def query(
    db: State, user_id: str, mood: Mood | None = None, search: str | None = None, favorite: bool | None = None
) -> list[JournalEntry] | UserError:
    """List journal entries with optional filtering."""
    # Check if user exists
    if user_id not in db.journal_entries:
        return []

    entries = db.journal_entries[user_id]
    filtered_entries = []

    for entry in entries:
        # Apply mood filter if specified
        if mood is not None and entry.mood != mood:
            continue

        # Apply search filter if specified
        if search is not None:
            search_text = search.lower()
            if search_text not in entry.title.lower() and search_text not in entry.content.lower():
                continue

        # Apply favorite filter if specified
        if favorite is not None and entry.favorite != favorite:
            continue

        # Entry passed all filters
        filtered_entries.append(entry)

    return filtered_entries
