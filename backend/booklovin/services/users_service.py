from booklovin.core.database import get_database
from booklovin.models.users import UserLogin
from booklovin.core.config import oauth2_scheme


async def get_user(email: str | None = None, id: str | None = None) -> UserLogin | None:
    db = get_database()
    return (
        await db.users.find_one({"email": email})
        if email
        else await db.users.find_one({"_id": id})
    )
