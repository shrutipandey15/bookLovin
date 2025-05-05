"""Database helper for mock db: Users"""

from json import dumps, loads

from booklovin.models.users import User

from .core import database, get_user_key


async def create(user: User) -> str:
    model = user.model_dump()
    async with database() as db:
        await db.set(get_user_key(user.email), dumps(model))
        return user.email


async def get(email: str) -> User | None:
    async with database() as db:
        user_data = await db.get(get_user_key(email))
        if user_data:
            return User.model_validate(loads(user_data))
    return None
