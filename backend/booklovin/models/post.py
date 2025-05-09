from time import time
from uuid import uuid4
from pydantic import BaseModel, Field


class NewPost(BaseModel):
    title: str
    content: str
    links: list[dict[str, str]] = Field(default_factory=list)
    imageUrl: str = ""


class Post(NewPost):
    uid: str = Field(default_factory=lambda: uuid4().hex)
    creationTime: int = Field(default_factory=lambda: int(time()))
    authorId: str
    lastLike: int = 0


class Count(BaseModel):
    count: int
