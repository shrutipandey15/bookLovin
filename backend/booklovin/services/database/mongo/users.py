"""Database helper for mongo: Users"""

from booklovin.models.errors import UserError
from booklovin.models.users import User
from pymongo.asynchronous.database import AsyncDatabase as Database


async def get(db: Database, email: str | None = None, uid: str | None = None) -> User | None:
    req = {}
    if email:
        req["email"] = email
    elif uid:
        req["uid"] = uid
    obj = await db.users.find_one(req)
    if obj:
        return User.from_dict(obj)
    return None


async def create(db: Database, user: User) -> None | UserError:
    await db.users.insert_one(user.model_dump())
    return None
