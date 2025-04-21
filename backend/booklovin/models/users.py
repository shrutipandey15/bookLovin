from typing import Optional
from pydantic import BaseModel
from enum import IntEnum, auto


class UserRole(IntEnum):
    """Different user types / classes"""

    STANDARD = auto()
    PUBLISHER = auto()
    EDITOR = auto()


class UserLogin(BaseModel):
    email: str
    password: str


class User(BaseModel):
    name: str
    description: str = ""
    role: UserRole = UserRole.STANDARD
    link: Optional[str] = ""
    location: Optional[str] = "unknown"
    active: bool = True
