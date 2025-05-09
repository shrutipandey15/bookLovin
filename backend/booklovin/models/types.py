from typing import Any, Dict, List, Protocol, runtime_checkable

from booklovin.models.errors import ErrorCode, UserError, gen_error
from fastapi import FastAPI
from pydantic import BaseModel, Field

from .post import NewPost, Post
from .users import User


class ServiceSetup(BaseModel):
    async def setup(self, app: FastAPI):
        pass

    async def teardown(self, app: FastAPI):
        pass


@runtime_checkable
class PostService(Protocol):
    async def create(self, db: Any, post: Post) -> None | UserError: ...
    async def delete(self, db: Any, post_id: str) -> None | UserError: ...
    async def update(self, db: Any, post_id: str, post_data: Post) -> None | UserError: ...
    async def get_one(self, db: Any, post_id: str) -> Post | None: ...
    async def get_all(self, db: Any, start: int, end: int) -> List[Post]: ...
    async def get_recent(self, db: Any, user: User) -> List[Post] | UserError: ...
    async def get_popular(self, db: Any) -> List[Post] | UserError: ...
    async def like(self, db: Any, post_id: str) -> None | UserError: ...


@runtime_checkable
class UserService(Protocol):
    async def get(self, db: Any, email: str) -> User | None: ...
    async def create(self, db: Any, user: User) -> None | UserError: ...
