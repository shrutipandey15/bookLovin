"""Database helper for mongo: Users"""

import pymongo
from booklovin.models.users import User
from fastapi import Depends, Request


async def get(email: str, db: pymongo.asynchronous.database.AsyncDatabase) -> User | None:
    obj = await db.users.find_one({"email": email})
    db.us
    if obj:
        return User.model_validate(obj)
    return None


async def create(user: User, db: pymongo.asynchronous.database.AsyncDatabase) -> str:
    result = await db.users.insert_one(user.model_dump())
    return str(result.inserted_id)
