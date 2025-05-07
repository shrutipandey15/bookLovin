"""Database helper for mock db: Users"""

from json import dumps, loads

from booklovin.models.users import User

from .core import get_user_key
from redis.asyncio import Redis


async def create(db: Redis, user: User) -> str:
    model = user.model_dump()
    await db.set(get_user_key(user.email), dumps(model))
    return user.email


async def get(db: Redis, email: str) -> User | None:
    user_data = await db.get(get_user_key(email))
    if user_data:
        return User.model_validate(loads(user_data))
    return None
