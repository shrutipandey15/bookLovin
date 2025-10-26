from pydantic import BaseModel
from typing import List, Optional
from .base import FlexModel
from .post import Post

class UserPublic(BaseModel):
    """A public-facing user model without sensitive data."""
    uid: str
    username: str
    email: str
    bio: Optional[str] = None
    favorite_quote: Optional[str] = None

class UserProfile(FlexModel):
    """The complete data for a user's profile page."""
    user: UserPublic
    posts: List[Post]

class UpdateQuoteRequest(BaseModel):
    quote: str