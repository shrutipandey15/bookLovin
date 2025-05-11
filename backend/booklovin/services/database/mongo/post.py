"""Database helpers for mongo: posts"""

from contextlib import suppress
from datetime import datetime, timedelta, timezone
from typing import cast, Sequence, Mapping

import pymongo.errors
from booklovin.core.settings import RECENT_POSTS_LIMIT
from booklovin.models.errors import UserError
from booklovin.models.post import Post
from booklovin.models.users import User
from pymongo.asynchronous.database import AsyncDatabase as Database


async def _add_likes(db: Database, post: dict) -> dict:
    post["likes"] = await db.likes.count_documents({"post_id": post["uid"]})
    return post


async def create(db: Database, post: Post) -> None | UserError:
    await db.posts.insert_one(post.model_dump())
    return None


async def get_all(db: Database, start: int, end: int) -> list[Post]:
    return await db.posts.find({}).sort("creationTime", -1).skip(start).limit(end - start).to_list(length=None)


async def get_one(db: Database, post_id: str) -> Post | None:
    post = await db.posts.find_one({"uid": post_id})
    if post:
        await _add_likes(db, post)
    return post


async def update(db: Database, post_id: str, post_data: Post) -> None | UserError:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    await db.posts.update_one({"uid": post_id}, {"$set": update_data})
    return None


async def delete(db: Database, post_id: str) -> None | UserError:
    """Deletes a post by its ID."""
    await db.posts.delete_one({"uid": post_id})
    return None


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
        .to_list()
    )
    return result


async def get_popular(db: Database) -> list[Post] | UserError:
    """
    Retrieves the most popular posts within the last 'days_period' days.
    """
    days_period = 1

    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_period)

    pipeline = [
        {"$match": {"liked_at": {"$gte": cutoff_date}}},
        {"$group": {"_id": "$post_id", "likes": {"$sum": 1}}},
        {"$sort": {"likes": -1}},
        {"$limit": RECENT_POSTS_LIMIT},
        {
            "$lookup": {
                "from": "posts",  # Name of your posts collection
                "localField": "post_id",  # id in likes
                "foreignField": "uid",  # id in posts
                "as": "post_details",
            }
        },
        {
            # If post_details is an array (even of 1), unwind it.
            # If a post was deleted after being liked, this will filter it out.
            "$unwind": "$post_details"
        },
        {
            # Promote the post_details to the root of the document
            "$replaceRoot": {"newRoot": "$post_details"}
        },
    ]

    workaround = cast(Sequence[Mapping], pipeline)
    cursor = await db.likes.aggregate(workaround, batchSize=RECENT_POSTS_LIMIT)

    popular_post_docs = await cursor.to_list(length=RECENT_POSTS_LIMIT)

    return [Post(**doc) for doc in popular_post_docs]


async def like(db: Database, post_id: str, user_id: str) -> None | UserError:
    """Likes a post by its ID, storing the timestamp of the like."""
    like_document = {"post_id": post_id, "user_id": user_id, "liked_at": datetime.now(timezone.utc)}
    with suppress(pymongo.errors.DuplicateKeyError):
        await db.likes.insert_one(like_document)
    return None
