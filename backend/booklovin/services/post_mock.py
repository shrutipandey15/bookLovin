from typing import List
from booklovin.models.post import Post

posts = []


async def create_post(post: Post) -> str:
    posts.append(post.model_dump())
    return str(len(posts))


async def get_all_posts() -> List[dict]:
    return posts


async def update_post(post_id: str, post_data: Post) -> int:
    return 1


async def delete_post(post_id: str) -> int:
    return 1
