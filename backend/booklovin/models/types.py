from typing import Any, Dict, List, Protocol

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .post import Post
from .users import User


class ServiceSetup(BaseModel):
    async def setup(self, app: FastAPI):
        pass

    async def teardown(self, app: FastAPI):
        pass


class PostService(Protocol):
    async def create(self, db: Any, post: Post) -> str: ...
    async def get_all(self, db: Any) -> List[Post]: ...
    async def get_one(self, db: Any, post_id: str) -> Post: ...
    async def update(self, db: Any, post_id: str, post_data: Post) -> int: ...
    async def delete(self, db: Any, post_id: str) -> int: ...


class UserService(Protocol):
    async def get(self, db: Any, email: str) -> User | None: ...
    async def create(self, db: Any, user: User) -> str: ...
