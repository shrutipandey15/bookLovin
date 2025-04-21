from pydantic import BaseModel, Field


class Post(BaseModel):
    title: str
    content: str
    links: list[dict[str, str]] = Field(default_factory=list)
    imageUrl: str = ""
    creationTime: int = 0
    authorId: str
