"""Database helpers for mocked db: Posts"""

import itertools
from typing import List

from bson import ObjectId

from booklovin.models.post import Post
from .core import state


async def create(db: None, post: Post) -> str:
    post_id = state.posts_count
    state.posts.append(post)
    state.posts_count += 1
    state.save(db)
    return str(post_id)


async def get_all(db: None) -> List[Post]:
    return state.posts.copy()


async def get_one(db: None, post_id: str) -> Post:
    return state.posts[int(post_id)]


async def update(db: None, post_id: str, post_data: Post) -> int:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    count = itertools.count()
    post = state.posts[int(post_id)]
    model = post.model_dump()
    for key, value in model.items():
        if getattr(post, key) == value:
            next(count)
            setattr(post, key, value)
    state.save(db)
    return next(count)


async def delete(db: None, post_id: str) -> int:
    """Deletes a post by its ID."""
    post = await get_one(db, post_id)
    try:
        state.posts.remove(post)
    except ValueError:
        return 0
    else:
        state.save(db)
    return 1
