import contextlib
from fastapi import FastAPI, Request
import typing

import pymongo
from booklovin.core.config import DB_NAME, MONGO_SERVER
from booklovin.services.interfaces import ServiceSetup


class MongoSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.client = pymongo.AsyncMongoClient(*MONGO_SERVER)
        app.state.db = app.state.client[DB_NAME]

    async def teardown(self, app: FastAPI):
        await app.state.client.close()


def init() -> ServiceSetup:
    return MongoSetup()
