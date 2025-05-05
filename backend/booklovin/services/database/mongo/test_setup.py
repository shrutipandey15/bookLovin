import pymongo
from booklovin.core.config import DB_NAME, MONGO_SERVER


def setup(user_data):
    mymongo = pymongo.MongoClient(*MONGO_SERVER)
    db = mymongo[DB_NAME]

    users_collection = db["users"]
    users_collection.delete_many({})
    db["posts"].delete_many({})

    users_collection.insert_one(user_data)
    mymongo.close()
