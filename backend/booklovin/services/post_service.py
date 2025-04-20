from typing import List
from booklovin.models.post import Post
from booklovin.core.database import get_database


async def create_post(post: Post) -> str:
    new_post = post.model_dump()
    db = get_database()
    result = await db.posts.insert_one(new_post)
    return result.inserted_id.toString()


async def get_all_posts() -> List[dict]:
    db = get_database()
    posts = await db.posts.find().to_list(length=None)
    return posts
