import json
import os
from dataclasses import dataclass, field

from booklovin.models.post import Post
from booklovin.models.types import ServiceSetup
from booklovin.models.users import User
from fastapi import FastAPI

DB_FILE = "/tmp/booklovin_mock.db"


class MockSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.db = None


@dataclass
class _State:
    posts: list[Post] = field(default_factory=list)
    posts_count: int = 0
    users: list[User] = field(default_factory=list)
    users_count: int = 0

    def save(self, db=None):
        if not DB_FILE:
            return
        json_str = json.dumps(
            {
                "posts": [p.model_dump() for p in self.posts],
                "posts_count": self.posts_count,
                "users": [p.model_dump() for p in self.users],
                "users_count": self.users_count,
            }
        )
        with open(DB_FILE, "w") as f:
            f.write(json_str)

    def load(self, db=None):
        if DB_FILE and os.path.exists(DB_FILE):
            data = json.loads(open(DB_FILE).read())
            self.posts_count = data["posts_count"]
            self.users_count = data["users_count"]
            self.users = [User.model_validate(user) for user in data["users"]]
            self.posts = [Post.model_validate(post) for post in data["posts"]]


state = _State()


def init() -> ServiceSetup:
    state.load()
    return MockSetup()
