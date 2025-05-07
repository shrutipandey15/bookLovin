"""Database helper for mongo: Users"""

from booklovin.models.users import User
from pymongo.asynchronous.database import AsyncDatabase as Database


async def get(db: Database, email: str) -> User | None:
    obj = await db.users.find_one({"email": email})
    if obj:
        return User.model_validate(obj)
    return None


async def create(db: Database, user: User) -> str:
    result = await db.users.insert_one(user.model_dump())
    return str(result.inserted_id)
