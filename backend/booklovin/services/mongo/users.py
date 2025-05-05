"""Database helper for mongo: Users"""

from booklovin.core.config import pwd_context
from booklovin.models.users import User, UserLogin

from booklovin.services.mongo.core import database


async def get(email: str | None = None, uid: str | None = None) -> UserLogin | None:
    async with database() as db:
        return await db.users.find_one({"email": email}) if email else await db.users.find_one({"_id": uid})


async def create(user: User) -> str:
    async with database() as db:
        user.password = pwd_context.hash(user.password)
        result = await db.users.insert_one(user.model_dump())
        return str(result.inserted_id)
