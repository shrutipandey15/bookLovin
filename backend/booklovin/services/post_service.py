from typing import List
from booklovin.models.post import PostCreate

posts_db = []


def create_post(post: PostCreate):
    new_post = post.model_dump()
    new_post["id"] = len(posts_db) + 1
    posts_db.append(new_post)
    return new_post


def get_all_posts() -> List[dict]:
    return posts_db
