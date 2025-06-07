"""Journal API endpoints for managing user journal entries."""

from booklovin.core.config import APIResponse
from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, NewJournalEntry, Mood
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["journal"])


@router.post("/", response_model=JournalEntry | UserError, response_class=APIResponse)
async def create_journal_entry(request: Request, post: NewJournalEntry, user: User = Depends(get_from_token)) -> JournalEntry:
    """Create one journal entry."""
    model = post.model_dump()
    new_entry = JournalEntry(authorId=user.uid, **model)

    await database.journal.create(db=request.app.state.db, entry=new_entry)
    return new_entry


@router.delete("/{entry_id}", response_model=None | UserError, response_class=APIResponse)
async def delete_journal_entry(request: Request, entry_id: str, user: User = Depends(get_from_token)) -> None | UserError:
    """Delete a journal entry by ID."""
    result = await database.journal.delete(db=request.app.state.db, entry_id=entry_id)
    if isinstance(result, UserError):
        return result
    return None


@router.put("/{entry_id}", response_model=None | UserError, response_class=APIResponse)
async def update_journal_entry(
    request: Request, entry_id: str, entry: NewJournalEntry, user: User = Depends(get_from_token)
) -> None | UserError:
    """Update an existing journal entry."""
    result = await database.journal.update(db=request.app.state.db, author_id=user.uid, entry_id=entry_id, journal_entry=entry)
    if isinstance(result, UserError):
        return result
    return None


@router.get("/", response_model=list[JournalEntry] | UserError, response_class=APIResponse)
async def list_journal_entries(
    request: Request,
    user: User = Depends(get_from_token),
    mood: Mood | None = None,
    search: str | None = None,
    favorite: bool | None = None,
) -> list[JournalEntry] | UserError:
    """List journal entries with optional filtering."""

    result = await database.journal.query(db=request.app.state.db, user_id=user.uid, mood=mood, search=search, favorite=favorite)

    if isinstance(result, UserError):
        return result
    return result or []


routers = [router]
