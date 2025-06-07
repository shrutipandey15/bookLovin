"Pydantic models for Comments"

# Ideally, these should be in booklovin.models.comment or booklovin.models.post
from booklovin.models.base import FlexModel, UserObject


class NewComment(FlexModel):
    postId: str
    content: str


class Comment(UserObject, NewComment): ...
