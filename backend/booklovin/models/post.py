from booklovin.models.base import FlexModel, UserObject
from pydantic import BaseModel, Field


class NewPost(FlexModel):
    title: str
    content: str
    links: list[dict[str, str]] = Field(default_factory=list)
    imageUrl: str = ""


class Post(NewPost, UserObject):
    lastLike: int = 0
    likes: int = 0


class Count(BaseModel):
    count: int
