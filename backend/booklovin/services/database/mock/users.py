"""Database helper for mock db: Users"""

from booklovin.models.users import User

from .core import state


async def create(user: User) -> str:
    uid = state.users_count
    state.users_count += 1
    state.users.append(user)
    state.save()
    return str(uid)


async def get(email: str) -> User | None:
    for user in state.users:
        if user.email == email:
            return User.model_validate(user)
    return None
