"""Routes for /posts"""

from typing import List
from fastapi import APIRouter
from booklovin.services.post_service import (
    create_post,
    get_all_posts,
    get_one_post,
    delete_post,
    update_post,
)
from booklovin.models.post import Post

router = APIRouter(tags=["posts"])


# create
@router.post("/", status_code=201)
async def create_book_post(post: Post) -> dict:
    post_id = await create_post(post)
    return dict(id=post_id)


# list all
@router.get("/", response_model=List[Post])
async def read_all_posts() -> List[Post]:
    return await get_all_posts()


# get one
@router.get("/{post_id}", response_model=Post)
async def read_one_post(post_id: str) -> Post:
    return await get_one_post(post_id)


# update
# TODO: allow partial updates
@router.put("/{post_id}", response_model=int)
async def update_book_post(post_id: str, post: Post) -> int:
    return await update_post(post_id, post)


# delete
@router.delete("/{post_id}", response_model=int)
async def delete_book_post(post_id: str) -> int:
    return await delete_post(post_id)
