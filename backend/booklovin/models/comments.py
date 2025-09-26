"Pydantic models for Comments"

# Ideally, these should be in booklovin.models.comment or booklovin.models.post
from booklovin.models.base import FlexModel, UserObject
from pydantic import field_validator
import bleach


class NewComment(FlexModel):
    postId: str
    content: str

    @field_validator("content")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={}, strip=True)


class Comment(UserObject, NewComment): ...
