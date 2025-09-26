from datetime import datetime, timezone
from enum import IntEnum, auto

from booklovin.models.base import FlexModel, UserObject, optional_fields
from pydantic import Field, field_serializer, field_validator
import bleach


class Mood(IntEnum):
    HEARTBROKEN = auto()
    HEALING = auto()
    EMPOWERED = auto()


class NewJournalEntry(FlexModel):
    mood: Mood
    content: str
    title: str = ""
    writingTime: int = 0  # time spent to write the journal entry
    tags: list[str] = Field(default_factory=list)
    favorite: bool = False

    @field_validator("content", "title")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={}, strip=True)

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
