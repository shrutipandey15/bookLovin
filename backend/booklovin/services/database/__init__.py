"""Database connector"""

import importlib

from typing import Protocol, Any, Dict, List

from booklovin.models.users import User
from booklovin.models.post import Post
from booklovin.core import config

sub_services = ["post", "users"]
if config.DEBUG:
    sub_services.append("test_setup")


class PostService(Protocol):
    async def create(self, post: Post) -> str: ...
    async def get_all(self) -> List[Post]: ...
    async def get_one(self, post_id: str) -> Post: ...
    async def update(self, post_id: str, post_data: Post) -> int: ...
    async def delete(self, post_id: str) -> int: ...


class UserService(Protocol):
    async def get(self, email: str) -> User | None: ...
    async def create(self, user: User) -> str: ...


post: PostService
users: UserService


def init(backend: str):
    namespace = "booklovin.services.database"
    core = importlib.import_module(f".{backend}.core", namespace)
    core.init()
    globs = globals()
    for submodule in sub_services:
        m = importlib.import_module(f".{backend}.{submodule}", namespace)
        globs[submodule] = m
