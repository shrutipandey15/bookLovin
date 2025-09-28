from booklovin.core.config import APIResponse
from booklovin.models.confessions import Confession, NewConfession
from booklovin.models.errors import UserError
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["confessions"])

@router.post("/", response_model=Confession | UserError, response_class=APIResponse)
async def create_confession(request: Request, new_confession: NewConfession, user: User = Depends(get_from_token)) -> Confession:
    """Create one confession."""
    confession = Confession.from_new_model(new_confession, authorId=user.uid)
    await database.confessions.create(db=request.app.state.db, entry=confession, user=user)
    return confession

@router.get("/", response_model=list[Confession] | UserError, response_class=APIResponse)
async def get_all_confessions(request: Request, user: User = Depends(get_from_token)) -> list[Confession]:
    """Get all confessions."""
    result = await database.confessions.query(db=request.app.state.db)
    return result or []

@router.get("/{confession_id}", response_model=Confession | UserError, response_class=APIResponse)
async def get_confession(request: Request, confession_id: str, user: User = Depends(get_from_token)) -> Confession | UserError:
    """Get one specific confession."""
    result = await database.confessions.get_one(db=request.app.state.db, confession_id=confession_id)
    return result

routers = [router]