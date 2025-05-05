from dataclasses import dataclass, field

from booklovin.models.post import Post
from booklovin.models.users import User


@dataclass
class _State:
    posts: list[Post] = field(default_factory=list)
    posts_count: int = 0
    users: list[User] = field(default_factory=list)
    users_count: int = 0


state = _State()


def init():
    pass
