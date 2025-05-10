import pymongo
from booklovin.core.config import DB_NAME, MONGO_SERVER


def setup(user_data):
    mymongo: pymongo.MongoClient = pymongo.MongoClient(*MONGO_SERVER)
    db = mymongo[DB_NAME]

    for name in ("posts", "likes", "users"):
        db[name].delete_many({})

    db["users"].insert_one(user_data)
    mymongo.close()
