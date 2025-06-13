from pydantic import Field
from booklovin.models.base import FlexModel, UserObject, optional_fields
from enum import IntEnum, auto
from datetime import datetime, timezone


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


@optional_fields
class JournalEntryUpdate(NewJournalEntry): ...


class JournalEntry(UserObject, NewJournalEntry):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
