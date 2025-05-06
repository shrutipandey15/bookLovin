"""Database helpers for mocked db: Posts"""

import itertools
from typing import List

from bson import ObjectId

from booklovin.models.post import Post
from .core import State


async def create(db: State, post: Post) -> str:
    post_id = db.posts_count
    db.posts.append(post)
    db.posts_count += 1
    db.save()
    return str(post_id)


async def get_all(db: State) -> List[Post]:
    return db.posts.copy()


async def get_one(db: State, post_id: str) -> Post:
    return db.posts[int(post_id)]


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


async def delete(db: State, post_id: str) -> int:
    """Deletes a post by its ID."""
    post = await get_one(db, post_id)
    try:
        db.posts.remove(post)
    except ValueError:
        return 0
    else:
        db.save()
    return 1
