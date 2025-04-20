"""Database connector"""

import pymongo

SERVER = ("localhost", 27017)
client = None


def get_database() -> pymongo.AsyncMongoClient:
    global client
    if not client:
        client = pymongo.AsyncMongoClient(*SERVER)
    return client["booklovin"]
