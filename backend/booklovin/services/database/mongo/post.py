"""Database helpers for mongo: posts"""

from booklovin.core.settings import RECENT_POSTS_LIMIT
from booklovin.models.errors import UserError
from booklovin.models.post import Post
from booklovin.models.users import User
from pymongo.asynchronous.database import AsyncDatabase as Database


async def _addLikes(db: Database, post: dict) -> dict:
    liked_by = await db.likes.find_one({"uid": post["uid"]})
    if liked_by:
        post["likes"] = len(liked_by["users"])
    return post


async def create(db: Database, post: Post) -> None | UserError:
    new_post = post.model_dump()
    await db.posts.insert_one(new_post)


async def get_all(db: Database, start: int, end: int) -> list[Post]:
    return await db.posts.find({}).sort("creationTime", -1).skip(start).limit(end - start).to_list(length=None)


async def get_one(db: Database, post_id: str) -> Post | None:
    post = await db.posts.find_one({"uid": post_id})
    if post:
        await _addLikes(db, post)
    return post


async def update(db: Database, post_id: str, post_data: Post) -> None | UserError:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    await db.posts.update_one({"uid": post_id}, {"$set": update_data})
    return None


async def delete(db: Database, post_id: str) -> None | UserError:
    """Deletes a post by its ID."""
    await db.posts.delete_one({"uid": post_id})


async def get_recent(db: Database, user: User) -> list[Post] | UserError:
    """Returns a list of recent subscribed posts"""
    result = (
        await db.posts.find(
            {
                "authorId": user.email,
            }
        )
        .sort("creationTime", -1)
        .limit(RECENT_POSTS_LIMIT)
        .to_list(length=None)
    )
    return result


async def get_popular(db: Database) -> list[Post] | UserError:
    """get most popular posts"""
    return await db.posts.find({}).sort("lastLike", -1).limit(RECENT_POSTS_LIMIT).to_list(length=None)


async def like(db: Database, post_id: str, user_id: str) -> None | UserError:
    """Likes a post by its ID."""
    likes = await db.likes.find_one({"uid": post_id})
    if not likes:
        await db.likes.insert_one({"uid": post_id, "users": [user_id]})
    else:
        await db.likes.update_one({"uid": post_id}, {"$addToSet": {"users": user_id}})
    return None
