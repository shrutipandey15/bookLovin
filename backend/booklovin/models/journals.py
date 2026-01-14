from datetime import datetime, timezone
from enum import StrEnum
from typing import Optional

from booklovin.models.base import FlexModel, UserObject, optional_fields
from pydantic import BaseModel, Field, field_serializer, field_validator
import bleach


# Abstract mood types - symbols, not emotions
class MoodType(StrEnum):
    LIGHT = "light"  # ○
    HEAVY = "heavy"  # ●
    TANGLED = "tangled"  # ∿
    SHARP = "sharp"  # △
    SOFT = "soft"  # ◠
    STILL = "still"  # —


class LinkedBook(BaseModel):
    """A book linked to a journal entry."""

    book_id: str  # OpenLibrary key
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None


class NewJournalEntry(FlexModel):
    content: str
    title: str = ""
    writingTime: int = 0  # time spent to write the journal entry
    tags: list[str] = Field(default_factory=list)
    favorite: bool = False
    # Optional ambient context - never required
    mood: Optional[str] = None  # abstract mood id or null
    linked_books: list[LinkedBook] = Field(default_factory=list)
    # User preferences (remembered)
    font: str = "serif"
    paper: str = "warm"

    @field_validator("content", "title")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        # Allow HTML tags for rich text content
        allowed_tags = ["p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "code", "pre", "a"]
        allowed_attrs = {"a": ["href", "title"]}
        return bleach.clean(v, tags=allowed_tags, attributes=allowed_attrs, strip=True)

    @field_validator("tags", mode="before")
    @classmethod
    def sanitize_tags(cls, v: list[str]) -> list[str]:
        if not isinstance(v, list):
            return v
        return [bleach.clean(tag, tags=[], attributes={}, strip=True) for tag in v]


@optional_fields
class JournalEntryUpdate(NewJournalEntry): ...


class JournalEntry(UserObject, NewJournalEntry):
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_serializer("updatedAt")
    def to_json_updatedAt(self, v: datetime, _) -> float:
        return v.timestamp()
