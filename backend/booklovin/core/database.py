"""Database connector"""

import pymongo

SERVER = ("localhost", 27017)


def get_database() -> pymongo.AsyncMongoClient:
    return pymongo.AsyncMongoClient(*SERVER)["booklovin"]
