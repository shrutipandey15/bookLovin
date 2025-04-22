"""Database connector"""

from booklovin.core.config import MONGO_SERVER, DB_NAME
import pymongo


def get_database() -> pymongo.AsyncMongoClient:
    return pymongo.AsyncMongoClient(*MONGO_SERVER)[DB_NAME]
