from enum import IntEnum, auto
from typing import Optional

from booklovin.models.base import FlexModel
from pydantic import BaseModel


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
    name: str
    password: str
    email: str
    description: str = ""
    role: UserRole = UserRole.STANDARD
    link: Optional[str] = ""
    location: Optional[str] = "unknown"
    active: bool = True
