from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry


from .core import State


async def create(db: State, entry: JournalEntry) -> None | UserError:
    """create a post"""
    db.journal_entries[entry.authorId].append(entry)
    db.save()
    return None
