"""Database helper for mock db: Users"""

from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.models.users import User

from .core import State


async def create(db: State, user: User) -> None | UserError:
    uid = db.users_count
    db.users_count += 1
    db.users.append(user)
    db.save()


async def get(db: State, email: str) -> User | UserError:
    for user in db.users:
        if user.email == email:
            return User.model_validate(user)
    return gen_error(ErrorCode.NOT_FOUND, details="User not found")
