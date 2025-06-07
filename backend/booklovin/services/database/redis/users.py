"""Database helper for mock db: Users"""

from booklovin.models.errors import UserError
from booklovin.models.users import User
from redis.asyncio import Redis

from .core import get_user_key


async def create(db: Redis, user: User) -> None | UserError:
    await db.set(get_user_key(user.email), user.to_json())
    return None


async def get(db: Redis, email: str | None = None, uid: str | None = None) -> User | None:
    if email:
        user_data = await db.get(get_user_key(email))
    else:
        raise RuntimeError("Getting by uid isn't supported at the moment")
    if user_data:
        return User.from_json(user_data)
    return None
