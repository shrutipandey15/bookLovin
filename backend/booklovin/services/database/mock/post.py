"""Database helpers for mocked db: Posts"""

from typing import List

from booklovin.core.settings import RECENT_POSTS_LIMIT
from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.models.post import Post
from booklovin.models.users import User
from bson import ObjectId

from .core import State

POST_NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="Post not found")


async def create(db: State, post: Post) -> None | UserError:
    post_id = db.posts_count
    db.posts.append(post)
    db.posts_count += 1
    db.save()


async def get_all(db: State, start: int, end: int) -> List[Post]:
    return db.posts[start:end]


async def like(db: State, post_id: str, user_id: str) -> None | UserError:
    post = await get_one(db, post_id)
    if not post:
        return UserError(**POST_NOT_FOUND)
    db.likes[post_id].add(user_id)
    db.save()


async def get_recent(db: State, user: User) -> List[Post] | UserError:
    return db.posts[:RECENT_POSTS_LIMIT]  # Mocked recent posts


async def get_popular(db: State) -> List[Post] | UserError:
    """Returns the most popular posts."""
    sorted_likes = sorted(db.likes.items(), key=lambda x: len(x[1]), reverse=True)
    top_likes = sorted_likes[:RECENT_POSTS_LIMIT]
    results = [await get_one(db, post_id) for post_id, _ in top_likes]
    assert None not in results
    return results


async def get_one(db: State, post_id: str) -> Post | None:
    for post in db.posts:
        if post.uid == post_id:
            if post_id in db.likes:
                post.likes = len(db.likes[post_id])
            return post


async def update(db: State, post_id: str, post_data: Post) -> None | UserError:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    post = await get_one(db, post_id)
    model = post.model_dump()
    for key, value in update_data.items():
        if getattr(post, key) != value:
            setattr(post, key, value)
    db.save()


async def delete(db: State, post_id: str) -> None | UserError:
    """Deletes a post by its ID."""
    if post_id in db.likes:
        del db.likes[post_id]
    post = await get_one(db, post_id)
    if not post:
        return POST_NOT_FOUND
    try:
        db.posts.remove(post)
    except ValueError:
        return POST_NOT_FOUND
    else:
        db.posts_count -= 1
        db.save()
