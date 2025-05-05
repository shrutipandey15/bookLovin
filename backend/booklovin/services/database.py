"""Database connector"""

import importlib

from typing import Protocol, Any, Dict, List

from booklovin.models.users import User, UserLogin
from booklovin.models.post import Post


class PostService(Protocol):
    async def create(self, post: Post) -> str: ...
    async def get_all(self) -> List[dict]: ...
    async def get_one(self, post_id: str) -> Post: ...
    async def update(self, post_id: str, post_data: Post) -> int: ...
    async def delete(self, post_id: str) -> int: ...


class UserService(Protocol):
    async def get(self, email: str | None = None, uid: str | None = None) -> UserLogin | None: ...
    async def create(self, user: User) -> str: ...


post: PostService
users: UserService


def init(backend="mongo"):
    core = importlib.import_module(f"booklovin.services.{backend}.core")
    core.init()
    globs = globals()
    for submodule in ("post", "users"):
        m = importlib.import_module(f"booklovin.services.{backend}.{submodule}")
        globs[submodule] = m
