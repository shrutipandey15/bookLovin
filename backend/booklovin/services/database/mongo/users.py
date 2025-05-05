"""Database helper for mongo: Users"""

from booklovin.models.users import User

from .core import database


async def get(email: str) -> User | None:
    async with database() as db:
        obj = await db.users.find_one({"email": email})
        if obj:
            return User.model_validate(obj)


async def create(user: User) -> str:
    async with database() as db:
        result = await db.users.insert_one(user.model_dump())
        return str(result.inserted_id)
