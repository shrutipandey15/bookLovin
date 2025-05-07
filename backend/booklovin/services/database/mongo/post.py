"""Database helpers for mongo: posts"""

from typing import List

from booklovin.models.post import Post
from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase as Database


async def create(db: Database, post: Post) -> str:
    new_post = post.model_dump()
    result = await db.posts.insert_one(new_post)
    return str(result.inserted_id)


async def get_all(db: Database) -> List[Post]:
    posts = await db.posts.find().to_list(length=None)
    return posts


async def get_one(db: Database, post_id: str) -> Post:
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    return Post.model_validate(post)


async def update(db: Database, post_id: str, post_data: Post) -> int:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    result = await db.posts.update_one({"_id": ObjectId(post_id)}, update_data)
    return result.modified_count


async def delete(db: Database, post_id: str) -> int:
    """Deletes a post by its ID."""
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    return result.deleted_count
