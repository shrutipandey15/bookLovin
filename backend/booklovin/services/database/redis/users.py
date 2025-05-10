"""Database helper for mock db: Users"""

from json import dumps, loads

from booklovin.models.errors import UserError
from booklovin.models.users import User
from redis.asyncio import Redis

from .core import get_user_key


async def create(db: Redis, user: User) -> None | UserError:
    model = user.model_dump()
    await db.set(get_user_key(user.email), dumps(model))
    return None


async def get(db: Redis, email: str) -> User | None:
    user_data = await db.get(get_user_key(email))
    if user_data:
        return User.model_validate(loads(user_data))
    return None
