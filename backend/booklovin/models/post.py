from typing import Optional
from pydantic import BaseModel


class PostId(BaseModel):
    id: str


class Post(BaseModel):
    id: Optional[str] = ""
    title: str
    content: str
    image_url: str

