from booklovin.models.base import FlexModel, UserObject
from pydantic import BaseModel, Field, field_validator
import bleach


class NewPost(FlexModel):
    title: str
    content: str
    links: list[dict[str, str]] = Field(default_factory=list)
    imageUrl: str = ""

    @field_validator("title", "content")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={}, strip=True)


class Post(NewPost, UserObject):
    # lastLike: int = 0
    # likes: int = 0
    reactions: dict[str, int] = Field(default_factory=dict)


class Count(BaseModel):
    count: int
