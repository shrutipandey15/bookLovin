"""Database connector"""

import importlib

from typing import Protocol, Any, Dict, List

from booklovin.models.users import User
from booklovin.models.post import Post


class PostService(Protocol):
    async def create(self, post: Post) -> str: ...
    async def get_all(self) -> List[dict]: ...
    async def get_one(self, post_id: str) -> Post: ...
    async def update(self, post_id: str, post_data: Post) -> int: ...
    async def delete(self, post_id: str) -> int: ...


class UserService(Protocol):
    async def get(self, email: str) -> User | None: ...
    async def create(self, user: User) -> str: ...


post: PostService
users: UserService


def init(backend="mongo"):
    namespace = "booklovin.services.database"
    core = importlib.import_module(f".{backend}.core", namespace)
    core.init()
    globs = globals()
    for submodule in ("post", "users"):
        m = importlib.import_module(f".{backend}.{submodule}", namespace)
        globs[submodule] = m
