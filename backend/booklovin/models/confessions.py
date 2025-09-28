from booklovin.models.base import FlexModel, UserObject
from pydantic import Field
import bleach


class NewConfession(FlexModel):
    content: str
    tags: list[str] = Field(default_factory=list)

    @classmethod
    def sanitize(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={}, strip=True)


class Confession(UserObject, NewConfession): ...
