from datetime import datetime, timezone
from json import loads
from time import time
from uuid import uuid4

from pydantic import BaseModel, Field, SerializationInfo, field_serializer


class NewPost(BaseModel):
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

    def update(self, data: dict):
        for prop in NewPost.model_fields.keys():
            if prop in data:
                setattr(self, prop, data[prop])

    @classmethod
    def deserialize(kls, post_data: str):
        return kls.from_json(loads(post_data))

    @classmethod
    def from_json(kls, post: dict):
        post["creationTime"] = datetime.fromtimestamp(post["creationTime"], tz=timezone.utc)
        return Post.model_validate(post)

    @field_serializer("creationTime")
    def serialize_creationTime(self, v: datetime, info: SerializationInfo) -> float:
        return v.timestamp()


class Count(BaseModel):
    count: int
