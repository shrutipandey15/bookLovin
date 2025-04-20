from typing import List
from booklovin.models.post import PostCreate
from booklovin.core.database import get_database


async def create_post(post: PostCreate) -> str:
    new_post = post.model_dump()
    result = await get_database().insert_one(new_post)
    return result.inserted_id.toString()


async def get_all_posts() -> List[dict]:
    return []
