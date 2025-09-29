import os
from collections import defaultdict
from dataclasses import dataclass, field

from booklovin.core.utils import dumps, loads, red, convert_datetime_fields
from booklovin.models.comments import Comment
from booklovin.models.journals import JournalEntry
from booklovin.models.letters import Letter
from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.services.interfaces import ServiceSetup
from fastapi import FastAPI

DB_FILE = "/tmp/booklovin_mock.db"


def colMap(col, modelType):
    """
    Map a collection of items to a new collection using the provided factory function.

    Args:
        col: The collection to map
        factory: The factory function to apply to each item

    Returns:
        A new collection with the factory function applied to each item
    """
    factory = modelType.from_dict
    mapped = list(map(lambda x: convert_datetime_fields(factory(x), modelType), col))
    return mapped


@dataclass
class State:
    posts: list[Post] = field(default_factory=list)
    posts_count: int = 0
    users: list[User] = field(default_factory=list)
    users_count: int = 0
    likes: dict[str, set[str]] = field(default_factory=lambda: defaultdict(set))
    journal_entries: dict[str, list[JournalEntry]] = field(default_factory=lambda: defaultdict(list))
    comments: dict[str, list] = field(default_factory=lambda: defaultdict(list))
    letters: list[Letter] = field(default_factory=list)

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
            "comments": {k: [c.model_dump() for c in v] for k, v in self.comments.items()},
        })
        with open(DB_FILE, "w") as f:
            f.write(json_str)

    def load(self):
        if DB_FILE and os.path.exists(DB_FILE):
            data = loads(open(DB_FILE).read())
            self.posts_count = data["posts_count"]
            self.users_count = data["users_count"]
            self.users = colMap(data["users"], User)
            self.posts = colMap(data["posts"], Post)
            self.likes = defaultdict(set)
            self.likes.update({k: set(v) for k, v in data["likes"].items()})
            self.journal_entries = defaultdict(list)
            self.journal_entries.update({k: colMap(v, JournalEntry) for k, v in data["journal_entries"].items()})
            self.comments = defaultdict(list)
            self.comments.update({k: colMap(v, Comment) for k, v in data.get("comments", {}).items()})


class MockSetup(ServiceSetup):
    async def setup(self, app: FastAPI):
        app.state.db = State()
        app.state.db.load()


def init() -> ServiceSetup:
    return MockSetup()
