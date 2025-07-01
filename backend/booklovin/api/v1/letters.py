from fastapi import APIRouter, Depends, Request, HTTPException, status
from booklovin.core.config import APIResponse
from booklovin.models.letters import Letter, NewLetter
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token

router = APIRouter(tags=["letters"])

@router.post("/", response_model=Letter, status_code=status.HTTP_201_CREATED)
async def create_letter(
    new_letter_data: NewLetter, 
    request: Request,
    user: User = Depends(get_from_token)
):
    """Create a new letter."""
    db = request.app.state.db 
    letter = Letter.from_new_model(new_letter_data, author=user.uid)
    created_letter = await database.letters.create(db, letter)
    return created_letter

@router.get("/", response_model=list[Letter])
async def get_letters(request: Request, user: User = Depends(get_from_token)):
    """Retrieve all letters for the authenticated user."""
    db = request.app.state.db
    letters = await database.letters.get_all_for_user(db=db, user_id=user.uid)
    return letters

@router.put("/{letter_id}/open", response_model=Letter)
async def open_letter(letter_id: str, request: Request, user: User = Depends(get_from_token)):
    """Mark a specific letter as opened."""
    db = request.app.state.db
    updated_letter = await database.letters.mark_as_opened(db=db, letter_id=letter_id, user_id=user.uid)
    if not updated_letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
    return updated_letter

@router.delete("/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_letter_by_id(letter_id: str, request: Request, user: User = Depends(get_from_token)):
    """Delete a specific letter."""
    db = request.app.state.db
    success = await database.letters.delete(db=db, letter_id=letter_id, user_id=user.uid)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")

routers = [router]