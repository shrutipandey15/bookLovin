from datetime import datetime, timezone
from uuid import uuid4

from booklovin.models.base import FlexModel
from pydantic import BaseModel, Field, SerializationInfo, field_serializer


class NewPost(FlexModel):
    title: str
    content: str
    links: list[dict[str, str]] = Field(default_factory=list)
    imageUrl: str = ""


class Post(NewPost):
    uid: str = Field(default_factory=lambda: uuid4().hex)
    creationTime: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    authorId: str
    lastLike: int = 0
    likes: int = 0

    @field_serializer("creationTime")
    def serialize_creationTime(self, v: datetime, _: SerializationInfo) -> float:
        return v.timestamp()


class Count(BaseModel):
    count: int
