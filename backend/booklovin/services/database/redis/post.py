"""Database helper for mock db: Users"""

from json import dumps, loads

from booklovin.models.errors import UserError
from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.services import errors
from redis.asyncio import Redis


async def create(db: Redis, post: Post) -> None | UserError:
    new_post = post.model_dump()
    await db.set(f"posts:{post.uid}", dumps(new_post))
    return None


async def delete(db: Redis, post_id: str) -> None | UserError:
    await db.delete(f"posts:{post_id}")


async def get_one(db: Redis, post_id: str) -> Post | None:
    return Post.model_validate(loads(await db.get(f"posts:{post_id}")))


async def get_all(db: Redis, start: int, end: int) -> list[Post]:
    keys = await db.keys("posts:*")[start:end]
    posts = []
    for key in keys:
        post_data = await db.get(key)
        if post_data:
            posts.append(Post.model_validate(loads(post_data)))
    return posts


async def like(db: Redis, post_id: str, user_id: str) -> None | UserError:
    """Like a post"""
    post = await get_one(db, post_id)
    if not post:
        return errors.POST_NOT_FOUND
    if not user_id in post.liked_by:
        post.liked_by.append(user_id)
        await db.set(f"posts:{post_id}", dumps(post.model_dump()))
    return None


async def get_popular(db: Redis) -> list[Post] | UserError:
    """get most popular posts"""
    ...


async def get_recent(db: Redis, user: User) -> list[Post] | UserError:
    pass


async def update(db: Redis, post_id: str, post_data: Post) -> None | UserError:
    pass
