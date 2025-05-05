"""Database helper for mock db: Users"""

from json import dumps, loads

from booklovin.models.post import Post

from .core import database, get_user_key, get_post_key

POST_ID_COUNTER_KEY = "post:id"


async def create(post: Post) -> str:
    new_post = post.model_dump()
    async with database() as db:
        uid = await db.incr(POST_ID_COUNTER_KEY)
        await db.set(f"posts:{uid}", dumps(new_post))
        return str(uid)


async def get_one(post_id: str) -> Post:
    async with database() as db:
        return await db.get(f"posts:{post_id}")


async def get_all() -> list[Post]:
    async with database() as db:
        keys = await db.keys("posts:*")
        posts = []
        for key in keys:
            post_data = await db.get(key)
            if post_data:
                posts.append(Post.model_validate(loads(post_data)))
        return posts
