from booklovin.core.database import get_database
from booklovin.models.users import UserLogin, User
from booklovin.core.config import pwd_context


async def get_user(email: str | None = None, id: str | None = None) -> UserLogin | None:
    db = get_database()
    return await db.users.find_one({"email": email}) if email else await db.users.find_one({"_id": id})


async def create_user(user: User) -> str:
    db = get_database()
    user.password = pwd_context.hash(user.password)
    result = await db.users.insert_one(user.model_dump())
    return str(result.inserted_id)
