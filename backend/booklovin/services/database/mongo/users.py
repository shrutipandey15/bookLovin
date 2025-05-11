"""Database helper for mongo: Users"""

from booklovin.models.errors import UserError
from booklovin.models.users import User
from pymongo.asynchronous.database import AsyncDatabase as Database


async def get(db: Database, email: str) -> User | None:
    obj = await db.users.find_one({"email": email})
    if obj:
        return User.from_json(obj)
    return None


async def create(db: Database, user: User) -> None | UserError:
    await db.users.insert_one(user)
    return None
