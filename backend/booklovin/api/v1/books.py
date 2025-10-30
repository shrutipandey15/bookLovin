from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import List, Any

from booklovin.models.books import BookSearchResult, ShelfItem, ShelfItemCreate, ShelfStatus, UpdateBookFavoriteRequest, UpdateBookProgressRequest, UpdateShelfOrderRequest
from booklovin.services.external import open_library
from booklovin.services.database.mongo import books as db_books
from booklovin.utils.user_token import get_from_token
from booklovin.models.users import User
from booklovin.models.errors import ErrorCode, UserError
from booklovin.core.config import APIResponse

router = APIRouter()

routers = [router]

@router.get("/search", response_model=BookSearchResult, response_class=APIResponse)
async def search_open_library(
    q: str = Query(..., min_length=3),
    limit: int = 10
):
    """
    Search endpoint that proxies requests to Open Library.
    """
    search_results = await open_library.search_books(q, limit)
    return search_results

@router.get("/shelf", response_model=List[ShelfItem], response_class=APIResponse)
async def get_my_shelf(
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Get all books on the authenticated user's shelf.
    """
    db = request.app.state.db
    result = await db_books.get_user_shelf(db, current_user.uid)
    return result

@router.post("/shelf", response_model=ShelfItem, status_code=201, response_class=APIResponse)
async def add_to_my_shelf(
    item_create: ShelfItemCreate,
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Add a book to the authenticated user's shelf or update its status.
    """
    db = request.app.state.db

    try:
        book_details = await open_library.get_book_details(item_create.ol_key)
        page_count = book_details.get("number_of_pages_median") 
    except Exception:
        page_count = None

    shelf_item = ShelfItem(
        authorId=current_user.uid,
        **item_create.model_dump(),
        page_count=page_count
    )

    result = await db_books.add_book_to_shelf(db, current_user.uid, shelf_item)

    if isinstance(result, UserError):
         if result.error == ErrorCode.NOT_FOUND:
              raise HTTPException(status_code=404, detail=result.message)
         else:
              raise HTTPException(status_code=400, detail=result.message)

    return result

@router.delete("/shelf/{ol_key:path}", status_code=204)
async def remove_from_my_shelf(
    ol_key: str,
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Remove a book from the authenticated user's shelf.
    Returns 204 No Content on success.
    """
    db = request.app.state.db 

    if not ol_key.startswith('/'):
        ol_key = '/' + ol_key

    error = await db_books.remove_book_from_shelf(db, current_user.uid, ol_key)

    if error:
        raise HTTPException(status_code=404, detail=error.message)

    return None

@router.put("/shelf/{ol_key:path}/progress", response_model=ShelfItem, response_class=APIResponse)
async def update_my_book_progress(
    ol_key: str,
    progress_data: UpdateBookProgressRequest,
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Update the reading progress for a book on the user's shelf.
    """
    db = request.app.state.db

    if not ol_key.startswith('/'):
        ol_key = '/' + ol_key

    result = await db_books.update_book_progress(
        db, current_user.uid, ol_key, progress_data.progress
    )

    if isinstance(result, UserError):
        raise HTTPException(status_code=404, detail=result.message)
    
    return result

@router.put("/shelf/{ol_key:path}/favorite", response_model=ShelfItem, response_class=APIResponse)
async def update_my_book_favorite(
    ol_key: str,
    favorite_data: UpdateBookFavoriteRequest,
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Update the favorite status for a book on the user's shelf.
    """
    db = request.app.state.db

    if not ol_key.startswith('/'):
        ol_key = '/' + ol_key

    result = await db_books.update_book_favorite(
        db, current_user.uid, ol_key, favorite_data.is_favorite
    )

    if isinstance(result, UserError):
        raise HTTPException(status_code=404, detail=result.message)
    
    return result

@router.put("/shelf/order", response_model=List[ShelfItem], response_class=APIResponse)
async def update_my_shelf_order(
    order_data: UpdateShelfOrderRequest,
    request: Request,
    current_user: User = Depends(get_from_token)
):
    """
    Re-order the books on the user's shelf.
    """
    db = request.app.state.db

    result = await db_books.update_shelf_order(
        db, current_user.uid, order_data.ordered_keys
    )

    if isinstance(result, UserError):
        raise HTTPException(status_code=404, detail=result.message)
    
    return result