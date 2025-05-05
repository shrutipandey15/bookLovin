"""Database helper for mock db: Users"""

from booklovin.core.config import pwd_context
from booklovin.models.users import User
from .core import state


async def create(user: User) -> str:
    model = user.model_dump()
    model["id"] = state.users_count
    model["password"] = pwd_context.hash(user.password)
    state.users_count += 1
    state.users.append(model)
    state.save()
    return model["id"]


async def get(email: str) -> User | None:
    for user in state.users:
        if user.email == email:
            return User.model_validate(user)
