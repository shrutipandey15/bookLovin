from typing import Optional
from pydantic import BaseModel
from enum import IntEnum, auto


class UserRole(IntEnum):
    """Different user types / classes"""

    STANDARD = auto()
    PUBLISHER = auto()
    EDITOR = auto()


class UserId(BaseModel):
    id: str


class UserLogin(BaseModel):
    email: str
    password: str


class NewUser(UserLogin):
    username: str


class User(BaseModel):
    name: str
    password: str
    email: str
    description: str = ""
    role: UserRole = UserRole.STANDARD
    link: Optional[str] = ""
    location: Optional[str] = "unknown"
    active: bool = True
