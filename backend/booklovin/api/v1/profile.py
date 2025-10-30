from fastapi import APIRouter, Depends, Request, HTTPException, status
from booklovin.core.config import APIResponse
from booklovin.models.profile import UpdateGoalRequest, UserProfile, UpdateQuoteRequest, UpdateGenresRequest, UpdateArchetypeRequest
from booklovin.models.errors import UserError
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from typing import List

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

@router.put("/me/genres", response_model=User, response_class=APIResponse)
async def set_favorite_genres(
    request: Request,
    genres_data: UpdateGenresRequest,
    user: User = Depends(get_from_token)
) -> User | UserError:
    """Update the favorite genres for the authenticated user."""
    db = request.app.state.db
    result = await database.profile.update_user_genres(db, user.uid, genres_data.genres)
    if isinstance(result, UserError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.message)
    return result

@router.put("/me/goal", response_model=User, response_class=APIResponse)
async def set_reading_goal(
    request: Request,
    goal_data: UpdateGoalRequest,
    user: User = Depends(get_from_token)
) -> User | UserError:
    """Update the reading goal for the authenticated user."""
    db = request.app.state.db
    result = await database.profile.update_user_goal(db, user.uid, goal_data.year, goal_data.count)
    if isinstance(result, UserError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.message)
    return result

@router.put("/me/archetype", response_model=User, response_class=APIResponse)
async def set_literary_archetype(
    request: Request,
    archetype_data: UpdateArchetypeRequest,
    user: User = Depends(get_from_token)
) -> User | UserError:
    """Update the literary archetype for the authenticated user."""
    db = request.app.state.db
    result = await database.profile.update_user_archetype(
        db, user.uid, archetype_data.archetype
    )

    if isinstance(result, UserError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.message)

    return result