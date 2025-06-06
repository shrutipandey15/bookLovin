from pydantic import Field
from booklovin.models.base import FlexModel, UserObject
from enum import Enum, auto


class Mood(Enum):
    HEARTBROKEN = auto()
    HEALING = auto()
    ENPOWERED = auto()


class NewJournalEntry(FlexModel):
    mood: Mood
    content: str
    title: str = ""
    writingTime: int = 0  # time spent to write the journal entry
    tags: list[str] = Field(default_factory=list)
    favorite: bool = False


class JournalEntry(NewJournalEntry, UserObject): ...
