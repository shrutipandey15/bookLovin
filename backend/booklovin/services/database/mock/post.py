"""Database helpers for mocked db: Posts"""

import itertools
from typing import List

from bson import ObjectId

from booklovin.models.post import Post
from .core import state


async def create(post: Post) -> str:
    new_post = post.model_dump()
    post_id = state.posts_count
    new_post["id"] = post_id
    state.posts.append(new_post)
    state.posts_count += 1
    state.save()
    return post_id


async def get_all() -> List[dict]:
    return state.posts.copy()


async def get_one(post_id: str) -> Post:
    for post in state.posts:
        if post.id == post_id:
            return post


async def update(post_id: str, post_data: Post) -> int:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    count = itertools.count()
    for post in state.posts:
        if post.id == post_id:
            for key, value in update_data.items():
                if getattr(post, key) == value:
                    next(count)
                    setattr(post, key, value)
            state.save()
            return next(count)


async def delete(post_id: str) -> int:
    """Deletes a post by its ID."""
    post = get_one(post_id)
    try:
        state.posts.remove(post)
    except ValueError:
        return 0
    else:
        state.save()
    return 1
