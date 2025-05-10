"""Routes for /posts"""

from typing import List

from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.models.post import NewPost, Post
from booklovin.models.users import User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["posts"])

ABUSIVE_USAGE = gen_error(ErrorCode.INVALID_PARAMETER, details="Abusive usage")
NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="Post not found")


# create
@router.post("/", response_model=Post | UserError)
async def create_post(request: Request, post: NewPost, user: User = Depends(get_from_token)) -> Post:
    """Create one post"""
    model = post.model_dump()
    new_post = Post(authorId=user.email, **model)

    await database.post.create(db=request.app.state.db, post=new_post)
    return new_post


# list all, deprecated
@router.get("/", response_model=List[Post] | UserError)
async def read_all_posts(request: Request, s: int, e: int, user: User = Depends(get_from_token)) -> List[Post] | UserError:
    """Get a range of posts (from most recent to oldest)"""
    assert e > s
    if e - s > 40:
        return ABUSIVE_USAGE
    return await database.post.get_all(db=request.app.state.db, start=s, end=e)


@router.get("/recent", response_model=List[Post] | UserError)
async def read_recent_posts(request: Request, user: User = Depends(get_from_token)) -> List[Post] | UserError:
    """Returns a list of recent subscribed posts"""
    return await database.post.get_recent(db=request.app.state.db, user=user)


@router.get("/popular", response_model=List[Post] | UserError)
async def read_popular_posts(request: Request, user: User = Depends(get_from_token)) -> List[Post] | UserError:
    """Returns a list of recent popular posts"""
    return await database.post.get_popular(db=request.app.state.db)


# get one
@router.get("/{post_id}", response_model=Post | UserError)
async def read_one_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> Post | UserError:
    "Get one specific post"
    post = await database.post.get_one(db=request.app.state.db, post_id=post_id)
    return post or NOT_FOUND


# update
@router.put("/{post_id}", response_model=None | UserError)
async def update_post(request: Request, post_id: str, post: Post, user: User = Depends(get_from_token)) -> None:
    "Update a specific post"
    await database.post.update(db=request.app.state.db, post_id=post_id, post_data=post)


@router.put("/{post_id}/like", response_model=None | UserError)
async def like_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> None:
    "Like a specific post"
    await database.post.like(db=request.app.state.db, post_id=post_id, user_id=user.email)
    return None


# delete
@router.delete("/{post_id}", response_model=None | UserError)
async def delete_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> None:
    "delete a specific post"

    return await database.post.delete(
        db=request.app.state.db,
        post_id=post_id,
    )
