from booklovin.core.config import MONGO_SERVER, DB_NAME
import contextlib
import typing
import pymongo
import pymongo.database


@contextlib.asynccontextmanager
async def database() -> typing.AsyncGenerator[pymongo.database.Database, None]:
    """Provides an asynchronous database connection context."""
    client = pymongo.AsyncMongoClient(*MONGO_SERVER)
    try:
        yield client[DB_NAME]
    finally:
        await client.close()


def init():
    pass
