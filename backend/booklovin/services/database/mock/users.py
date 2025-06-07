"""Database helper for mock db: Users"""

from booklovin.models.errors import UserError
from booklovin.models.users import User

from .core import State


async def create(db: State, user: User) -> None | UserError:
    db.users_count += 1
    db.users.append(user)
    db.save()
    return None


async def get(db: State, email: str | None = None, uid: str | None = None) -> User | None:
    match_func = lambda x: x.email == email if email else lambda x: x.uid == uid
    for user in db.users:
        if match_func(user):
            return user
    return None
