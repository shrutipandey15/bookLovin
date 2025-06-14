from datetime import datetime

from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.services.streak_logic import calculate_streak_changes
from booklovin.models.journals import JournalEntry, JournalEntryUpdate, Mood
from booklovin.models.users import User

from .core import State
from .users import get as get_user


async def trigger_new_journal_actions(db: State, user: User, entry_date: datetime):
    streak_data = calculate_streak_changes(
        entry_date=entry_date,
        last_journal_date=user.lastJournalDate,
        current_streak_start=user.currentStreakStart,
        longest_streak=user.longestStreak,
    )
    if streak_data:
        # update user data
        (await get_user(db, uid=user.uid)).update(streak_data)


async def create(db: State, entry: JournalEntry, user: User) -> None | UserError:
    """Create a journal entry."""
    db.journal_entries[entry.authorId].append(entry)
    await trigger_new_journal_actions(db, user, entry.creationTime)
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


async def update(db: State, user: User, entry_id: str, journal_entry: JournalEntryUpdate) -> None | UserError:
    """Update an existing journal entry."""

    # Check if user exists
    if user.uid not in db.journal_entries:
        return gen_error(ErrorCode.NOT_FOUND, f"No journal entries found for user {user.uid}.")

    # Find the entry to update
    for i, entry in enumerate(db.journal_entries[user.uid]):
        if entry.uid == entry_id:
            # Replace the entry
            db.journal_entries[user.uid][i].update(journal_entry.model_dump(exclude_unset=True))
            await trigger_new_journal_actions(db, user, entry.creationTime)
            db.save()
            return None

    # If we get here, entry wasn't found
    return gen_error(ErrorCode.NOT_FOUND, f"Journal entry with ID {entry_id} not found.")


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
