"""Database helper for mock db: Users"""

from booklovin.models.errors import UserError
from booklovin.models.users import User

from .core import State


async def create(db: State, user: User) -> None | UserError:
    db.users_count += 1
    db.users.append(user)
    db.save()
    return None


async def get(db: State, email: str) -> User | None:
    for user in db.users:
        if user.email == email:
            return user
    return None
