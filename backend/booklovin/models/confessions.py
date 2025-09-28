from datetime import datetime
from uuid import UUID, uuid4
from booklovin.models.base import FlexModel, UserObject
from pydantic import Field
import bleach

class NewConfession(FlexModel):
    text: str

    @classmethod
    def sanitize(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={}, strip=True)

class Confession(UserObject, NewConfession):
    id: UUID = Field(default_factory=uuid4)
    createdAt: datetime = Field(default_factory=datetime.utcnow)