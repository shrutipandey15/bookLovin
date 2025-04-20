from fastapi import APIRouter
from app.services.post_service import create_post, get_all_posts, PostCreate
from typing import List
from app.models.post import PostResponse

router = APIRouter()

@router.post("/", status_code=201)
def create_book_post(post: PostCreate):
    return create_post(post)

@router.get("/", response_model=List[PostResponse])
def read_all_posts() -> List[PostResponse]:
    return get_all_posts()
