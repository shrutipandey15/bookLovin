"""Database helper for mock db: Users"""

from booklovin.core.config import pwd_context
from booklovin.models.users import User, UserLogin
from booklovin.services.mock.core import state


async def create(user: User) -> str:
    user.password = pwd_context.hash(user.password)
    model = user.model_dump()
    model["id"] = state.users_count
    state.users_count += 1
    state.users.append(model)
    return model["id"]


async def get(email: str | None = None, uid: str | None = None) -> UserLogin | None:
    for user in state.users:
        if user["email"] == email or user["id"] == uid:
            return user
