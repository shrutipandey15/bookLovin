from typing import List
from fastapi import APIRouter
from booklovin.services.post_service import create_post, get_all_posts
from booklovin.models.post import Post, PostId

router = APIRouter()


@router.post("/", status_code=201)
async def create_book_post(post: Post) -> PostId:
    post_id = await create_post(post)
    return PostId(id=post_id)


@router.get("/", response_model=List[Post])
async def read_all_posts() -> List[Post]:
    return await get_all_posts()
