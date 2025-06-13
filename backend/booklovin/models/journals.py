from pydantic import Field
from booklovin.models.base import FlexModel, UserObject
from enum import IntEnum, auto
from typing import Optional
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
    wordCount: int = 0 # New field for word count
    tags: list[str] = Field(default_factory=list)
    favorite: bool = False

class JournalEntryUpdate(FlexModel):
    mood: Optional[Mood] = None
    content: Optional[str] = None
    title: Optional[str] = None
    writingTime: Optional[int] = None  # time spent to write the journal entry
    wordCount: Optional[int] = None  # New field for word count
    tags: Optional[list[str]] = None
    favorite: Optional[bool] = None


class JournalEntry(UserObject, NewJournalEntry):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
