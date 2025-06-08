from pydantic import Field
from booklovin.models.base import FlexModel, UserObject
from enum import IntEnum, auto


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


class JournalEntry(UserObject, NewJournalEntry): ...
