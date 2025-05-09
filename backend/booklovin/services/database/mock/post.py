"""Database helpers for mocked db: Posts"""

import itertools
from typing import List

from booklovin.core.settings import RECENT_POSTS_LIMIT
from booklovin.models.post import Post
from bson import ObjectId

from .core import State


async def create(db: State, post: Post) -> None:
    post_id = db.posts_count
    db.posts.append(post)
    db.posts_count += 1
    db.save()


async def get_all(db: State, start: int, end: int) -> List[Post]:
    return db.posts[start:end]


async def get_recent(db: State, user: str) -> List[Post]:
    return db.posts[:RECENT_POSTS_LIMIT]  # Mocked recent posts


async def get_one(db: State, post_id: str) -> Post | None:
    for post in db.posts:
        if post.uid == post_id:
            return post


async def update(db: State, post_id: str, post_data: Post) -> int:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    count = itertools.count()
    post = db.posts[int(post_id)]
    model = post.model_dump()
    for key, value in model.items():
        if getattr(post, key) == value:
            next(count)
            setattr(post, key, value)
    db.save()
    return next(count)


async def delete(db: State, post_id: str) -> bool:
    """Deletes a post by its ID."""
    post = await get_one(db, post_id)
    try:
        db.posts.remove(post)
    except ValueError:
        return False
    else:
        db.save()
        return True
