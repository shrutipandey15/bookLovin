"""Abstraction for the Posts access"""

from typing import List
from bson import ObjectId
from booklovin.models.post import Post
from booklovin.core.database import get_database


async def create_post(post: Post) -> str:
    new_post = post.model_dump()
    db = get_database()
    result = await db.posts.insert_one(new_post)
    return result.inserted_id.toString()


async def get_all_posts(response_model=List[dict]) -> List[dict]:
    db = get_database()
    posts = await db.posts.find().to_list(length=None)
    return posts


async def get_one_post(post_id: str, response_model=Post) -> Post:
    db = get_database()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})


async def update_post(post_id: str, post_data: Post) -> int:
    """Updates an existing post."""
    db = get_database()
    update_data = post_data.model_dump(
        exclude_unset=True
    )  # Only update provided fields
    result = await db.posts.update_one({"_id": ObjectId(post_id)}, update_data)
    return result.modified_count


async def delete_post(post_id: str) -> int:
    """Deletes a post by its ID."""
    db = get_database()
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    return result.deleted_count
