from booklovin.core.database import get_database
from booklovin.models.users import UserLogin
from booklovin.core.config import pwd_context


async def get_user(email: str | None = None, id: str | None = None) -> UserLogin | None:
    db = get_database()
    return await db.users.find_one({"email": email}) if email else await db.users.find_one({"_id": id})


async def create_user(name: str, email: str, password: str) -> str:
    db = get_database()
    hashed_password = pwd_context.hash(password)
    result = await db.users.insert_one({"username": name, "email": email, "password": hashed_password})
    return str(result.inserted_id)
