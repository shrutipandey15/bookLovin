"""Database helper for mock db: Users"""

from booklovin.models.users import User

from .core import state


async def create(db: None, user: User) -> str:
    uid = state.users_count
    state.users_count += 1
    state.users.append(user)
    state.save(db)
    return str(uid)


async def get(db: None, email: str) -> User | None:
    for user in state.users:
        if user.email == email:
            return User.model_validate(user)
    return None
