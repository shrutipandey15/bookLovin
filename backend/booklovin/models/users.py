from typing import Optional
from pydantic import BaseModel
from enum import IntEnum, auto


class UserRole(IntEnum):
    standard = auto()
    publisher = auto()
    editor = auto()


class UserLogin(BaseModel):
    email: str
    password: str


class User(BaseModel):
    name: str
    description: str
    role: UserRole = UserRole.standard
    link: Optional[str] = ""
    location: Optional[str] = "unknown"
