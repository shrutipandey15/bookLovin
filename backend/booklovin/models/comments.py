"Pydantic models for Comments"

# Ideally, these should be in booklovin.models.comment or booklovin.models.post
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class NewComment(BaseModel):
    content: str


class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    postId: str
    authorId: str
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
