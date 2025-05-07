from json import dumps

import redis

from .core import DB_NAME, REDIS_SERVER, get_user_key


def setup(user_data):
    client = redis.from_url(f"redis://{REDIS_SERVER[0]}:{REDIS_SERVER[1]}/{DB_NAME}")
    client.flushdb()
    uid = user_data["email"]
    client.set(get_user_key(uid), dumps(user_data))
    client.close()
