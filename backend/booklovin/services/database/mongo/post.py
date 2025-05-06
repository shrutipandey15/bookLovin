"""Database helpers for mongo: posts"""

from typing import List

import pymongo
from booklovin.models.post import Post
from bson import ObjectId
from fastapi import Depends


async def create(post: Post, db: pymongo.asynchronous.database.AsyncDatabase) -> str:
    new_post = post.model_dump()
    result = await db.posts.insert_one(new_post)
    return str(result.inserted_id)


async def get_all(db: pymongo.asynchronous.database.AsyncDatabase) -> List[Post]:
    posts = await db.posts.find().to_list(length=None)
    return posts


async def get_one(post_id: str, db: pymongo.asynchronous.database.AsyncDatabase) -> Post:
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    return Post.model_validate(post)


async def update(post_id: str, post_data: Post, db: pymongo.asynchronous.database.AsyncDatabase) -> int:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    result = await db.posts.update_one({"_id": ObjectId(post_id)}, update_data)
    return result.modified_count


async def delete(post_id: str, db: pymongo.asynchronous.database.AsyncDatabase) -> int:
    """Deletes a post by its ID."""
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    return result.deleted_count
