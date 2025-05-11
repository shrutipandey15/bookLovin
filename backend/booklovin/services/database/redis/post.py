"""Database helper for mock db: Users"""

from booklovin.core import settings
from booklovin.core.utils import loads
from booklovin.models.errors import UserError
from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.services import errors
from redis.asyncio import Redis


async def create(db: Redis, post: Post) -> None | UserError:
    new_post = post.serialize()
    await db.set(f"posts:{post.uid}", new_post)
    return None


async def delete(db: Redis, post_id: str) -> None | UserError:
    for name in [f"likes:{post_id}", f"posts:{post_id}"]:
        await db.delete(name)
    return None


async def get_one(db: Redis, post_id: str) -> Post | None:
    data = await db.get(f"posts:{post_id}")
    if data:
        model = Post.deserialize(data)
        model.likes = await db.scard(f"likes:{post_id}")  # type: ignore
        return model
    return None


async def get_all(db: Redis, start: int, end: int) -> list[Post]:
    _, keys = await db.scan(match="posts:*", cursor=start, count=end - start)
    posts = []
    for key in keys:
        post_data = await db.get(key)
        if post_data:
            post = Post.deserialize(post_data)
            posts.append(post)
    return posts


async def like(db: Redis, post_id: str, user_id: str) -> None | UserError:
    """Like a post"""
    post = await get_one(db, post_id)
    if not post:
        return errors.POST_NOT_FOUND
    await db.sadd(f"likes:{post_id}", user_id)  # type: ignore
    return None


async def get_popular(db: Redis) -> list[Post] | UserError:
    """get most popular posts"""
    keys = await db.keys("posts:*")
    posts = []
    for key in keys:
        post_data = await db.get(key)
        if post_data:
            post = Post.deserialize(post_data)
            post.likes = await db.scard(f"likes:{post.uid}")  # type: ignore
            posts.append(post)
    posts.sort(key=lambda x: x.likes, reverse=True)
    return posts[: settings.RECENT_POSTS_LIMIT]


async def get_recent(db: Redis, user: User) -> list[Post] | UserError:
    """Returns a list of recent subscribed posts"""
    keys = await db.keys("posts:*")
    posts = []
    for key in keys:
        post_data = await db.get(key)
        if post_data:
            post = Post.deserialize(post_data)
            if post.authorId == user.email:
                posts.append(post)
    posts.sort(key=lambda x: x.creationTime, reverse=True)
    return posts[: settings.RECENT_POSTS_LIMIT]


async def update(db: Redis, post_id: str, post_data: Post) -> None | UserError:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)  # Only update provided fields
    post = await get_one(db, post_id)

    if post:
        post.update(update_data)
        await db.set(f"posts:{post_id}", post.serialize())
    else:
        return errors.POST_NOT_FOUND
    return None
