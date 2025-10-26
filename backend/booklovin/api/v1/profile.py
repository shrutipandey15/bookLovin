from fastapi import APIRouter, Depends, Request, HTTPException, status
from booklovin.core.config import APIResponse
from booklovin.models.profile import UserProfile, UpdateQuoteRequest
from booklovin.models.errors import UserError
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token

router = APIRouter()
routers = [router]

@router.get("/{name}", response_model=UserProfile | UserError, response_class=APIResponse)
async def get_user_profile(
    request: Request,
    name: str,
    user: User = Depends(get_from_token)
) -> UserProfile | UserError:
    """Get a user's public profile data by name."""
    db = request.app.state.db
    result = await database.profile.get_profile_by_name(db, name)
    
    if isinstance(result, UserError):
        raise HTTPException(status_code=404, detail=result.message)
    
    return result

@router.put("/me/quote", response_model=User, response_class=APIResponse)
async def set_favorite_quote(
    request: Request,
    quote_data: UpdateQuoteRequest,
    user: User = Depends(get_from_token)
) -> User | UserError:
    """Update the favorite quote for the authenticated user."""
    db = request.app.state.db
    result = await database.profile.update_user_quote(db, user.uid, quote_data.quote)

    if isinstance(result, UserError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.message)

    return result