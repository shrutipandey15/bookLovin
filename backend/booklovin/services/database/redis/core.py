import contextlib
import typing

import redis.asyncio as redis
from booklovin.core.config import DB_NAME, REDIS_SERVER


def get_post_key(uid: str, postid: str):
    return f"user:{uid}:posts:{postid}"


def get_user_key(uid: str):
    return f"user:{uid}:data"


@contextlib.asynccontextmanager
async def database() -> typing.AsyncGenerator[redis.Redis, None]:
    client = redis.from_url(f"redis://{REDIS_SERVER[0]}:{REDIS_SERVER[1]}/{DB_NAME}")
    yield client
    await client.aclose()


def init():
    pass
