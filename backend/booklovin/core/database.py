"""Database connector"""

from booklovin.core.config import MONGO_SERVER
import pymongo


def get_database() -> pymongo.AsyncMongoClient:
    return pymongo.AsyncMongoClient(*MONGO_SERVER)["booklovin"]
