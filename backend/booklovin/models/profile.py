from pydantic import BaseModel, Field
from typing import List, Optional
from .base import FlexModel
from .post import Post

class UserStats(BaseModel):
    books_read_count: int = Field(default=0)
    journal_entries_count: int = Field(default=0)
    posts_count: int = Field(default=0)
    followers_count: int = Field(default=0)

class ReadingPersonality(BaseModel):
    favorite_genres: List[str] = Field(default_factory=list)
    reading_goal_year: Optional[int] = None
    reading_goal_count: Optional[int] = None
    literary_archetype: Optional[str] = None

class UserPublic(BaseModel):
    """A public-facing user model without sensitive data."""
    uid: str
    username: str
    email: str
    bio: Optional[str] = None
    favorite_quote: Optional[str] = None
    stats: Optional[UserStats] = None
    reading_personality: Optional[ReadingPersonality] = None

class UserProfile(FlexModel):
    """The complete data for a user's profile page."""
    user: UserPublic
    posts: List[Post]

class UpdateQuoteRequest(BaseModel):
    quote: str

class UpdateGenresRequest(BaseModel):
    genres: List[str]

class UpdateGoalRequest(BaseModel):
    year: int
    count: int
class UpdateArchetypeRequest(BaseModel):
    archetype: str