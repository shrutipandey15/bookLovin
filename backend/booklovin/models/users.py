from datetime import datetime, timezone
from enum import IntEnum, auto
from typing import Optional
from uuid import uuid4

from booklovin.models.base import FlexModel
from pydantic import Field, field_serializer


class UserRole(IntEnum):
    """Different user types / classes"""

    STANDARD = auto()
    PUBLISHER = auto()
    EDITOR = auto()


class UserLogin(FlexModel):
    email: str
    password: str


class NewUser(UserLogin):
    username: str


class User(FlexModel):
    uid: str = Field(default_factory=lambda: uuid4().hex)
    creationTime: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    name: str
    password: str
    email: str
    description: str = ""
    role: UserRole = UserRole.STANDARD
    link: Optional[str] = ""
    location: Optional[str] = "unknown"
    active: bool = True
    last_journal_date: Optional[datetime] = None
    current_streak: int = 0
    longest_streak: int = 0
    streak_start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_serializer("creationTime")
    def to_json_creationTime(self, v: datetime, _) -> float:
        return v.timestamp()
