import os
from collections import defaultdict
from dataclasses import dataclass, field

from booklovin.core.utils import dumps, loads, red
from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.models.journals import JournalEntry
from booklovin.services.interfaces import ServiceSetup
from fastapi import FastAPI

DB_FILE = "/tmp/booklovin_mock.db"


@dataclass
class State:
    posts: list[Post] = field(default_factory=list)
    posts_count: int = 0
    users: list[User] = field(default_factory=list)
    users_count: int = 0
    likes: dict[str, set[str]] = field(default_factory=lambda: defaultdict(set))
    journal_entries: dict[str, list[JournalEntry]] = field(default_factory=lambda: defaultdict(list))

    def debug(self):
        def _show_list(title, item):
            print(red(title))
            for i in item:
                print(" ", i)

        _show_list("Posts", self.posts)
        _show_list("Users", self.users)
        _show_list("Likes", self.likes)
        print(f"Users: {self.users_count}, Posts: {self.posts_count}")

    def save(self, db=None):
        if not DB_FILE:
            return
        json_str = dumps({
            "posts": [p.model_dump() for p in self.posts],
            "posts_count": self.posts_count,
            "users": [p.model_dump() for p in self.users],
            "users_count": self.users_count,
            "journal_entries": {k: [je.model_dump() for je in v] for k, v in self.journal_entries.items()},
            "likes": {k: list(v) for k, v in self.likes.items()},
        })
        with open(DB_FILE, "w") as f:
            f.write(json_str)

    def load(self):
        if DB_FILE and os.path.exists(DB_FILE):
            data = loads(open(DB_FILE).read())
            self.posts_count = data["posts_count"]
            self.users_count = data["users_count"]
            self.users = [User.from_json(user) for user in data["users"]]
            self.posts = [Post.from_json(post) for post in data["posts"]]
            self.likes = defaultdict(set)
            self.likes.update({k: set(v) for k, v in data["likes"].items()})
            self.journal_entries = defaultdict(list)
            self.journal_entries.update({k: [JournalEntry.from_json(je) for je in v] for k, v in data["journal_entries"].items()})


class MockSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.db = State()
        app.state.db.load()


def init() -> ServiceSetup:
    return MockSetup()
