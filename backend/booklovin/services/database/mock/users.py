"""Database helper for mock db: Users"""

from booklovin.models.users import User

from .core import State


async def create(db: State, user: User) -> str:
    uid = db.users_count
    db.users_count += 1
    db.users.append(user)
    db.save()
    return str(uid)


async def get(db: State, email: str) -> User | None:
    for user in db.users:
        if user.email == email:
            return User.model_validate(user)
    return None
