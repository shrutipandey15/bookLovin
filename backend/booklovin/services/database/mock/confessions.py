from typing import Any
from booklovin.models.confessions import Confession, NewConfession
from booklovin.models.users import User
from booklovin.services.errors import NOT_FOUND

class MockConfessionService:
    @staticmethod
    async def create_confession(db: Any, user: User, new_confession: NewConfession) -> Confession:
        confession = Confession(userId=user.uid, **new_confession.dict())
        if not hasattr(db, 'confessions'):
            db.confessions = []
        db.confessions.append(confession)
        return confession

    @staticmethod
    async def get_all_confessions(db: Any) -> list[Confession]:
        return getattr(db, 'confessions', [])

    @staticmethod
    async def get_confession(db: Any, confession_id: str) -> Confession:
        for confession in getattr(db, 'confessions', []):
            if str(confession.id) == confession_id:
                return confession
        raise NOT_FOUND