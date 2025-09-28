from typing import Any
from booklovin.models.confessions import Confession, NewConfession
from booklovin.models.users import User
from booklovin.services.errors import NOT_FOUND
from booklovin.models.errors import UserError


async def create(db: Any, user: User, confession: NewConfession) -> Confession:
    collection = db["confessions"]
    confession = Confession(authorId=user.uid, **confession.dict())
    await collection.insert_one(confession.dict())
    return confession


async def get_all(db: Any) -> list[Confession]:
    collection = db["confessions"]
    cursor = collection.find()
    return [Confession(**doc) for doc in await cursor.to_list(length=None)]


async def get(db: Any, confession_id: str) -> Confession | UserError:
    collection = db["confessions"]
    doc = await collection.find_one({"id": confession_id})
    if doc is None:
        return NOT_FOUND
    return Confession(**doc)
