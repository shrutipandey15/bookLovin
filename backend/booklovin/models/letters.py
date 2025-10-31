from datetime import datetime
from enum import StrEnum
from typing import Optional

from booklovin.models.base import UserObject, FlexModel
class LetterType(StrEnum):
    FUTURE = "future"
    PAST = "past"

class LetterStatus(StrEnum):
    SCHEDULED = "scheduled"
    OPENED = "opened"

class NewLetter(FlexModel):
    content: str
    target_date: datetime
    type: LetterType = LetterType.FUTURE
    word_count: int = 0

class Letter(UserObject, NewLetter):
    status: LetterStatus = LetterStatus.SCHEDULED
    opened_at: Optional[datetime] = None