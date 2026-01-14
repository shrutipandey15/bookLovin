"""Journal API endpoints for managing user journal entries."""

from typing import List

from booklovin.core.config import APIResponse
from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, NewJournalEntry, JournalEntryUpdate
from booklovin.models.users import User
from booklovin.models.books import ShelfItem
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

router = APIRouter(tags=["journal"])


class ShelfByStatus(BaseModel):
    """Books grouped by reading status."""

    reading: List[ShelfItem] = []
    read: List[ShelfItem] = []
    want_to_read: List[ShelfItem] = []
    dnf: List[ShelfItem] = []


@router.post("/", response_model=JournalEntry | UserError, response_class=APIResponse)
async def create_journal_entry(request: Request, post: NewJournalEntry, user: User = Depends(get_from_token)) -> JournalEntry:
    """Create one journal entry."""
    new_entry = JournalEntry.from_new_model(post, author=user.uid)

    await database.journal.create(db=request.app.state.db, entry=new_entry, user=user)
    return new_entry


@router.delete("/{entry_id}", response_model=None | UserError, response_class=APIResponse)
async def delete_journal_entry(request: Request, entry_id: str, user: User = Depends(get_from_token)) -> None | UserError:
    """Delete a journal entry by ID."""
    result = await database.journal.delete(db=request.app.state.db, entry_id=entry_id, user_id=user.uid)
    if isinstance(result, UserError):
        return result
    return None


@router.put("/{entry_id}", response_model=JournalEntry | UserError, response_class=APIResponse)
async def update_journal_entry(
    request: Request, entry_id: str, entry: JournalEntryUpdate, user: User = Depends(get_from_token)
) -> JournalEntry | UserError:
    """Update an existing journal entry."""
    result = await database.journal.update(db=request.app.state.db, user=user, entry_id=entry_id, journal_entry=entry)

    if isinstance(result, UserError):
        return result
    return result


@router.get("/", response_model=list[JournalEntry] | UserError, response_class=APIResponse)
async def list_journal_entries(
    request: Request,
    user: User = Depends(get_from_token),
    search: str | None = None,
    favorite: bool | None = None,
) -> list[JournalEntry] | UserError:
    """List journal entries with optional filtering."""
    result = await database.journal.query(db=request.app.state.db, user_id=user.uid, search=search, favorite=favorite)

    if isinstance(result, UserError):
        return result
    return result or []


@router.get("/books", response_model=ShelfByStatus, response_class=APIResponse)
async def get_books_for_journal(
    request: Request,
    user: User = Depends(get_from_token),
) -> ShelfByStatus:
    """Get user's shelf books grouped by status for linking to journal entries."""
    shelf_by_status = await database.books.get_shelf_by_status(db=request.app.state.db, user_id=user.uid)

    return ShelfByStatus(
        reading=shelf_by_status.get("reading", []),
        read=shelf_by_status.get("read", []),
        want_to_read=shelf_by_status.get("want_to_read", []),
        dnf=shelf_by_status.get("dnf", []),
    )


routers = [router]
