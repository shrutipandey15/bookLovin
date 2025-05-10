import redis.asyncio as redis
from booklovin.core.config import DB_NAME, REDIS_SERVER
from booklovin.services.interfaces import ServiceSetup
from fastapi import FastAPI


class RedisSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.db = redis.from_url(f"redis://{REDIS_SERVER[0]}:{REDIS_SERVER[1]}/{DB_NAME}")

    async def teardown(self, app: FastAPI):
        await app.state.db.aclose()


def get_user_key(uid: str):
    return f"user:{uid}:data"


def init() -> ServiceSetup:
    return RedisSetup()
