from booklovin.core.config import APIResponse
from booklovin.models.errors import UserError
from booklovin.models.journals import JournalEntry, NewJournalEntry
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["journal"])


@router.post("/", response_model=JournalEntry | UserError, response_class=APIResponse)
async def create_journal_entry(request: Request, post: NewJournalEntry, user: User = Depends(get_from_token)) -> JournalEntry:
    """Create one post"""
    model = post.model_dump()
    new_entry = JournalEntry(authorId=user.email, **model)

    await database.journal.create(db=request.app.state.db, entry=new_entry)
    return new_entry
