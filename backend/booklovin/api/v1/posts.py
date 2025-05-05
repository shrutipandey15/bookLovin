"""Routes for /posts"""

from typing import List

from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends

router = APIRouter(tags=["posts"])


# create
@router.post("/", status_code=201)
async def create_book_post(post: Post, user: User = Depends(get_from_token)) -> dict:
    post_id = await database.post.create(post)
    return dict(id=post_id)


# list all
@router.get("/", response_model=List[Post])
async def read_all_posts(user: User = Depends(get_from_token)) -> List[Post]:
    return await database.post.get_all()


# get one
@router.get("/{post_id}", response_model=Post)
async def read_one_post(post_id: str, user: User = Depends(get_from_token)) -> Post:
    return await database.post.get_one(post_id)


# update
# TODO: allow partial updates
@router.put("/{post_id}", response_model=int)
async def update_book_post(post_id: str, post: Post, user: User = Depends(get_from_token)) -> int:
    return await database.post.update(post_id, post)


# delete
@router.delete("/{post_id}", response_model=int)
async def delete_book_post(post_id: str, user: User = Depends(get_from_token)) -> int:
    return await database.post.delete(post_id)
