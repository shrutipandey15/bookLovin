from fastapi import FastAPI

import pymongo
from pymongo import TEXT
from booklovin.core.config import DB_NAME, MONGO_SERVER
from booklovin.services.interfaces import ServiceSetup


class MongoSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.client = pymongo.AsyncMongoClient(*MONGO_SERVER)
        db = app.state.client[DB_NAME]
        app.state.db = db

        await db.users.create_index([("email", 1)], unique=True)

        await db.posts.create_index([("creationTime", -1)])
        await db.posts.create_index([("authorId", 1)])
        await db.posts.create_index([("uid", 1)], unique=True)

        await db.likes.create_index([("post_id", 1), ("user_id", 1)], unique=True)
        await db.likes.create_index([("liked_at", -1), ("post_id", 1)])

        await db.journals.create_index([("uid", 1)], unique=True)
        await db.journals.create_index([("creationTime", -1), ("authorId", 1)])
        await db.journals.create_index([("title", TEXT), ("content", TEXT)])
        await db.journals.create_index([("tags", 1)])

    async def teardown(self, app: FastAPI):
        await app.state.client.close()


def init() -> ServiceSetup:
    return MongoSetup()
