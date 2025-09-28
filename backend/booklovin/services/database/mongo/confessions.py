from typing import Any
from booklovin.models.confessions import Confession, NewConfession
from booklovin.models.users import User
from booklovin.services.errors import NOT_FOUND

class MongoConfessionService:
    @staticmethod
    async def create_confession(db: Any, user: User, new_confession: NewConfession) -> Confession:
        collection = db["confessions"]
        confession = Confession(userId=user.uid, **new_confession.dict())
        await collection.insert_one(confession.dict())
        return confession

    @staticmethod
    async def get_all_confessions(db: Any) -> list[Confession]:
        collection = db["confessions"]
        cursor = collection.find()
        return [Confession(**doc) for doc in await cursor.to_list(length=None)]

    @staticmethod
    async def get_confession(db: Any, confession_id: str) -> Confession:
        collection = db["confessions"]
        doc = await collection.find_one({"id": confession_id})
        if doc is None:
            raise NOT_FOUND
        return Confession(**doc)